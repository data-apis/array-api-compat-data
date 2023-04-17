/**
* @license MIT
*
* Copyright (c) 2023 Consortium for Python Data API Standards.
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

var join = require( 'path' ).join;
var readDir = require( '@stdlib/fs-read-dir' ).sync;
var readFile = require( '@stdlib/fs-read-file' ).sync;
var replace = require( '@stdlib/string-replace' );
var uppercase = require( '@stdlib/string-base-uppercase' );


// VARIABLES //

var FOPTS = {
	'encoding': 'utf8'
};
var RE_HTML = /\.html$/;


// FUNCTIONS //

/**
* Loads template files.
*
* @private
* @throws {Error} unexpected error
* @returns {Object} object containing template file content
*/
function load() {
	var files;
	var tmp;
	var key;
	var o;
	var f;
	var i;

	// Retrieve the list of templates...
	tmp = readDir( __dirname );
	if ( tmp instanceof Error ) {
		throw tmp;
	}
	if ( tmp.length === 0 ) {
		throw new Error( 'unexpected error. Unable to resolve template files.' );
	}
	files = [];
	for ( i = 0; i < tmp.length; i++ ) {
		f = tmp[ i ];
		if ( RE_HTML.test( f ) ) {
			files.push( f );
		}
	}
	if ( files.length === 0 ) {
		throw new Error( 'unexpected error. Unable to resolve template files.' );
	}
	// Load template file content and build the hash...
	tmp = [];
	o = {};
	for ( i = 0; i < files.length; i++ ) {
		f = readFile( join( __dirname, files[ i ] ), FOPTS );
		if ( f instanceof Error ) {
			throw f;
		}
		key = uppercase( replace( files[ i ], RE_HTML, '' ) );
		o[ key ] = f;
	}
	return o;
}


// MAIN //

/**
* Templates.
*
* @private
* @name TEMPLATES
* @type {Object}
*/
var TEMPLATES = load(); // eslint-disable-line vars-on-top


// EXPORTS //

module.exports = TEMPLATES;
