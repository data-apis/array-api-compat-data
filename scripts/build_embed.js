#!/usr/bin/env node

/**
* @license MIT
*
* Copyright (c) 2023 Python Data APIs Consortium.
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
*/

/* eslint-disable node/no-unpublished-require */

'use strict';

// MODULES //

var path = require( 'path' );
var writeFile = require( '@stdlib/fs-write-file' ).sync;
var replace = require( '@stdlib/string-replace' );
var objectKeys = require( '@stdlib/utils-keys' );
var format = require( '@stdlib/string-format' );
var CLI = require( '@stdlib/cli-ctor' );
var DATA = require( './../data' );
var TMPL = require( './templates' );
var STYLESHEETS = require( './css' );
var stylesheets = require( './css/embed.json' );
var render = require( './render/embed.js' );
var config = require( './config.json' );


// VARIABLES //

var FOPTS = {
	'encoding': 'utf8'
};

// CLI options:
var CLI_OPTS = {
	'string': [
		'max-version'
	]
};

// Resolve the path to the output build directory:
var BUILD_DIR = path.resolve( __dirname, '..', 'build', 'embed' );


// MAIN //

/**
* Main execution sequence.
*
* @private
* @throws {Error} unexpected error
*/
function main() {
	var styles;
	var flags;
	var fpath;
	var html;
	var tmpl;
	var name;
	var tmp;
	var cli;
	var d;
	var v;
	var i;

	// Create a command-line interface:
	cli = new CLI({
		'options': CLI_OPTS
	});

	// Get any provided command-line options:
	flags = cli.flags();
	if ( flags[ 'max-version' ] ) {
		v = flags[ 'max-version' ];
	} else {
		v = config.max_version;
	}

	// Load stylesheets used to render an embedded compatibility table:
	styles = [];
	for ( i = 0; i < stylesheets.length; i++ ) {
		tmp = STYLESHEETS[ stylesheets[ i ] ];
		if ( tmp === void 0 ) {
			throw new Error( format( 'unexpected error. Unable to resolve stylesheet. Name: %s.', stylesheets[ i ] ) );
		}
		styles.push( tmp );
	}
	styles = styles.join( '\n' );
	styles = replace( styles, /\.\.\/img/g, '../../_static/images/compat' );

	// Update the HTML template for displaying an embedded compatibility table:
	tmpl = replace( TMPL.EMBED, '{{STYLES}}', styles );

	// For each API, render a compatibility table and write to disk:
	for ( i = 0; i < DATA.length; i++ ) {
		d = DATA[ i ];
		html = render( d, v );
		if ( html ) {
			tmp = replace( tmpl, '{{TABLE}}', html );

			name = objectKeys( d )[ 0 ]; // API name
			fpath = path.join( BUILD_DIR, name+'.html' );

			writeFile( fpath, tmp, FOPTS );
		}
	}
}

main();
