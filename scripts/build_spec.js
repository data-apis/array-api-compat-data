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
var readDir = require( '@stdlib/fs-read-dir' ).sync;
var readFile = require( '@stdlib/fs-read-file' ).sync;
var writeFile = require( '@stdlib/fs-write-file' ).sync;
var replace = require( '@stdlib/string-replace' );
var cwd = require( '@stdlib/process-cwd' );
var CLI = require( '@stdlib/cli-ctor' );


// VARIABLES //

var FOPTS = {
	'encoding': 'utf8'
};
var RE_HTML = /\.html$/;

// Resolve the path to the build directory containing rendered HTML tables which should be embedded in Sphinx docs:
var BUILD_DIR = path.resolve( __dirname, '..', 'build', 'embed' );

// Define a regular expression to match the Array API filename prefix:
var RE_PREFIX = /^array_api\./;

// Define a regular expression to identify where to insert compatibility data:
var RE_INSERT = /<\/article>/;

// Sphinx directories containing rendered APIs:
var FOLDERS = [
	'API_specification',
	'extensions'
];

// Command-line interface options:
var CLI_OPTS = {};


// MAIN //

/**
* Main execution sequence.
*
* @private
* @throws {Error} unexpected error
* @returns {void}
*/
function main() {
	var files;
	var fpath;
	var html;
	var args;
	var fdir;
	var dir;
	var tmp;
	var cli;
	var err;
	var f;
	var i;
	var j;

	// Create a command-line interface:
	cli = new CLI({
		'options': CLI_OPTS
	});

	// Get any provided command-line arguments:
	args = cli.args();
	if ( args.length === 0 ) {
		err = new Error( 'invalid invocation. Must provide a target directory.' );
		return cli.error( err );
	}
	// Resolve the directory containing Sphinx docs:
	dir = path.resolve( cwd(), args[ 0 ] );

	// Add compatibility tables to rendered Sphinx docs:
	for ( j = 0; j < FOLDERS.length; j++ ) {
		fdir = path.join( dir, FOLDERS[ j ], 'generated' );
		tmp = readDir( fdir );
		if ( tmp instanceof Error ) {
			return cli.error( tmp );
		}
		if ( tmp.length === 0 ) {
			err = new Error( 'unexpected error. Unable to resolve rendered Sphinx docs.' );
			return cli.error( err );
		}
		files = [];
		for ( i = 0; i < tmp.length; i++ ) {
			f = tmp[ i ];
			if ( RE_HTML.test( f ) ) {
				files.push( f );
			}
		}
		if ( files.length === 0 ) {
			err = new Error( 'unexpected error. Unable to resolve rendered Sphinx docs.' );
			return cli.error( err );
		}
		for ( i = 0; i < files.length; i++ ) {
			tmp = replace( files[ i ], RE_PREFIX, '' );
			fpath = path.join( BUILD_DIR, tmp );
			f = readFile( fpath, FOPTS );
			if ( f instanceof Error ) {
				console.error( 'Unable to resolve compatibility data: %s. Skipping...', tmp );
				continue;
			}
			fpath = path.join( fdir, files[ i ] );
			html = readFile( fpath, FOPTS );
			if ( html instanceof Error ) {
				return cli.error( html );
			}
			html = replace( html, RE_INSERT, '</article>'+f );
			writeFile( fpath, html, FOPTS );
		}
	}
}

main();
