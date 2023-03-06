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

/* eslint-disable no-underscore-dangle, node/no-unpublished-require */

'use strict';

// MODULES //

var path = require( 'path' );
var readDir = require( '@stdlib/fs-read-dir' ).sync;
var readJSON = require( '@stdlib/fs-read-json' ).sync;
var readFile = require( '@stdlib/fs-read-file' ).sync;
var objectKeys = require( '@stdlib/utils-keys' );
var replace = require( '@stdlib/string-replace' );
var lowercase = require( '@stdlib/string-base-lowercase' );
var LIBRARIES = require( './libraries.json' );


// VARIABLES //

var FOPTS = {
	'encoding': 'utf8'
};

// Specify a maximum version:
var MAX_VERSION = '*';

// Directory containing compatibility data:
var DATA_DIR = path.resolve( __dirname, '..', 'data' );

// Directory containing template data:
var TMPL_DIR = path.resolve( __dirname, 'templates' );

// Regular expression to test if a file path corresponds to a JSON data file:
var RE_JSON = /\.json$/;

// Templates...
var INDEX_HTML = readFile( path.join( TMPL_DIR, 'index.html' ), FOPTS );
var COMPAT_SECTION = readFile( path.join( TMPL_DIR, 'compat_section.html' ), FOPTS );
var TABLE_CONTAINER = readFile( path.join( TMPL_DIR, 'table_container.html' ), FOPTS );
var TABLE = readFile( path.join( TMPL_DIR, 'table.html' ), FOPTS );
var TABLE_HEAD = readFile( path.join( TMPL_DIR, 'table_head.html' ), FOPTS );
var TABLE_COLUMN_HEADER = readFile( path.join( TMPL_DIR, 'table_column_header.html' ), FOPTS );
var TABLE_BODY = readFile( path.join( TMPL_DIR, 'table_body.html' ), FOPTS );
var TABLE_ROW = readFile( path.join( TMPL_DIR, 'table_row.html' ), FOPTS );
var TABLE_ROW_HEADER = readFile( path.join( TMPL_DIR, 'table_row_header.html' ), FOPTS );
var SUPPORTS_NO = readFile( path.join( TMPL_DIR, 'supports_no.html' ), FOPTS );
var SUPPORTS_PARTIAL = readFile( path.join( TMPL_DIR, 'supports_partial.html' ), FOPTS );
var SUPPORTS_PREVIEW = readFile( path.join( TMPL_DIR, 'supports_preview.html' ), FOPTS );
var SUPPORTS_UNKNOWN = readFile( path.join( TMPL_DIR, 'supports_unknonwn.html' ), FOPTS );
var SUPPORTS_YES = readFile( path.join( TMPL_DIR, 'supports_yes.html' ), FOPTS );
var LEGEND = readFile( path.join( TMPL_DIR, 'legend.html' ), FOPTS );


// FUNCTIONS //

/**
* Returns a canonicalized library name.
*
* @private
* @param {string} name - library name
* @returns {string} canonical name
*/
function libraryName( name ) {
	var o = LIBRARIES[ lowercase( name ) ];
	if ( o ) {
		return o.name;
	}
	return name;
}

/**
* Renders HTML content for provided compatibility data.
*
* @private
* @param {Object} data - compatibility data
* @param {string} maxVersion - maximum version
* @returns {(string|null)} HTML string
*/
function render( data, maxVersion ) {
	var name;
	var out;
	var url;
	var d;

	// Get the API name:
	name = objectKeys( data )[ 0 ];
	d = data[ name ];

	// Check whether the API satisfies version constraints:
	if ( maxVersion !== '*' && d.__compat.version_added > maxVersion ) {
		return null;
	}
	// Get the specification URL:
	url = d.__compat.spec_url;

	// Render compatibility data:
	out = replace( COMPAT_SECTION, '{{NAME}}', name );
	out = replace( out, '{{URL}}', url );
	out = replace( out, '{{TABLE}}', renderCompat( d, name, maxVersion ) );
	out = replace( out, '{{LEGEND}}', LEGEND );

	return out;
}

/**
* Renders a compatibility table.
*
* @private
* @param {Object} data - compatibility data
* @param {string} name - API name
* @param {string} maxVersion - maximum version
* @returns {string} HTML string
*/
function renderCompat( data, name, maxVersion ) {
	var table;
	var head;
	var body;
	var libs;

	// Get the list of libraries:
	libs = objectKeys( data.__compat.support );

	// Render a table head:
	head = renderHead( libs );

	// Render the table body:
	body = renderBody( data, libs, name, maxVersion );

	// Render the table:
	table = replace( TABLE, '{{HEAD}}', head );
	table = replace( table, '{{BODY}}', body );

	// Wrap the table in a container element:
	return replace( TABLE_CONTAINER, '{{TABLE}}', table );
}

/**
* Renders a table head.
*
* @private
* @param {Array<string>} fields - list of field names
* @returns {string} HTML string
*/
function renderHead( fields ) {
	var out;
	var tmp;
	var f;
	var i;

	out = [];
	for ( i = 0; i < fields.length; i++ ) {
		f = fields[ i ];
		tmp = replace( TABLE_COLUMN_HEADER, '{{NAME}}', libraryName( f ) );
		tmp = replace( tmp, '{{LOWERCASE_NAME}}', lowercase( f ) );
		out.push( tmp );
	}
	return replace( TABLE_HEAD, '{{HEADERS}}', out.join( '\n' ) );
}

/**
* Renders a table body.
*
* @private
* @param {Object} data - compatibility data
* @param {Array<string>} columns - list of column field names
* @param {string} name - API name
* @param {string} maxVersion - maximum version
* @returns {string} HTML string
*/
function renderBody( data, columns, name, maxVersion ) {
	var support;
	var compat;
	var status;
	var fields;
	var tmpl;
	var rows;
	var row;
	var col;
	var th;
	var tc;
	var f;
	var n;
	var d;
	var c;
	var v;
	var o;
	var i;
	var j;

	// Get the list of compatibility fields:
	fields = objectKeys( data );

	// Render table rows...
	rows = [];
	for ( i = 0; i < fields.length; i++ ) {
		f = fields[ i ];
		if ( f === '__compat' ) {
			n = name;
			d = 0;
		} else {
			n = f;
			d = 1;
		}
		compat = data[ f ];

		// Check that the field does not exceed the maximum version...
		if ( maxVersion !== '*' ) {
			if ( f === '__compat' ) {
				v = compat.version_added;
			} else {
				v = compat.__compat.version_added;
			}
			if ( v > maxVersion ) {
				continue;
			}
		}

		// Render the row header:
		th = replace( TABLE_ROW_HEADER, '{{NAME}}', n );
		th = replace( th, '{{DEPTH}}', d.toString() );

		// Render the row cells:
		if ( f === '__compat' ) {
			support = compat.support;
		} else {
			support = compat.__compat.support;
		}
		tc = [];
		for ( j = 0; j < columns.length; j++ ) {
			col = columns[ j ];
			o = support[ col ];
			if ( o === null ) {
				tmpl = SUPPORTS_NO;
			} else if ( o === void 0 ) {
				tmpl = SUPPORTS_UNKNOWN;
			} else {
				status = o[ 0 ].status;

				// TODO: handle "deprecated" status
				if ( status.experimental ) {
					tmpl = SUPPORTS_PREVIEW;
				} else if ( status.partial_implementation ) {
					tmpl = SUPPORTS_PARTIAL;
				} else {
					tmpl = SUPPORTS_YES;
				}
			}
			c = replace( tmpl, '{{NAME}}', col );
			c = replace( c, '{{LOWERCASE_NAME}}', lowercase( col ) );
			c = replace( c, '{{RELEASE}}', ( o ) ? ( o[ 0 ].version_added || '' ) : '' );
			tc.push( c );
		}
		// Render the row:
		row = replace( TABLE_ROW, '{{HEADER}}', th );
		row = replace( row, '{{CELLS}}', tc.join( '\n' ) );

		rows.push( row );
	}
	return replace( TABLE_BODY, '{{ROWS}}', rows.join( '\n' ) );
}


// MAIN //

/**
* Main execution sequence.
*
* @private
* @throws {Error} unexpected error
*/
function main() {
	var files;
	var html;
	var tmp;
	var f;
	var i;

	// Retrieve the list of compatibility files...
	tmp = readDir( DATA_DIR );
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
			files.push( path.join( DATA_DIR, f ) );
		}
	}
	if ( files.length === 0 ) {
		throw new Error( 'unexpected error. Unable to resolve data files.' );
	}
	tmp = [];
	for ( i = 0; i < files.length; i++ ) {
		f = readJSON( files[ i ] );
		html = render( f, MAX_VERSION );
		if ( html ) {
			tmp.push( html );
		}
	}
	f = replace( INDEX_HTML, '{{TABLES}}', tmp.join( '\n' ) );
	console.log( f );
}

main();
