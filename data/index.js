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
var readJSON = require( '@stdlib/fs-read-json' ).sync;


// VARIABLES //

// Regular expression to test if a file path corresponds to a JSON data file:
var RE_JSON = /\.json$/;


// FUNCTIONS //

/**
* Loads compatibility data.
*
* @private
* @throws {Error} unexpected error
* @returns {Array<Object>} compatibility data
*/
function load() {
	var files;
	var tmp;
	var f;
	var i;

	tmp = readDir( __dirname );
	if ( tmp instanceof Error ) {
		throw tmp;
	}
	if ( tmp.length === 0 ) {
		throw new Error( 'unexpected error. Unable to resolve data files.' );
	}
	files = [];
	for ( i = 0; i < tmp.length; i++ ) {
		f = tmp[ i ];
		if ( RE_JSON.test( f ) ) {
			files.push( join( __dirname, f ) );
		}
	}
	if ( files.length === 0 ) {
		throw new Error( 'unexpected error. Unable to resolve data files.' );
	}
	for ( i = 0; i < files.length; i++ ) {
		f = readJSON( files[ i ] );
		if ( f instanceof Error ) {
			throw f;
		}
		files[ i ] = f;
	}
	return files;
}


// MAIN //

/**
* Compatibility data.
*
* @private
* @name DATA
* @type {Array<Object>}
*/
var DATA = load(); // eslint-disable-line vars-on-top


// EXPORTS //

module.exports = DATA;
