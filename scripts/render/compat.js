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

var objectKeys = require( '@stdlib/utils-keys' );
var replace = require( '@stdlib/string-replace' );
var lowercase = require( '@stdlib/string-base-lowercase' );
var TMPL = require( './../templates' );
var LIBRARIES = require( './../libraries.json' );


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
		tmp = replace( TMPL.TABLE_COLUMN_HEADER, '{{NAME}}', libraryName( f ) );
		tmp = replace( tmp, '{{LOWERCASE_NAME}}', lowercase( f ) );
		out.push( tmp );
	}
	return replace( TMPL.TABLE_HEAD, '{{HEADERS}}', out.join( '\n' ) );
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
		th = replace( TMPL.TABLE_ROW_HEADER, '{{NAME}}', n );
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
				tmpl = TMPL.SUPPORTS_NO;
			} else if ( o === void 0 ) {
				tmpl = TMPL.SUPPORTS_UNKNOWN;
			} else {
				status = o[ 0 ].status;

				// TODO: handle "deprecated" status
				if ( status.experimental ) {
					tmpl = TMPL.SUPPORTS_PREVIEW;
				} else if ( status.partial_implementation ) {
					tmpl = TMPL.SUPPORTS_PARTIAL;
				} else {
					tmpl = TMPL.SUPPORTS_YES;
				}
			}
			c = replace( tmpl, '{{NAME}}', col );
			c = replace( c, '{{LOWERCASE_NAME}}', lowercase( col ) );
			c = replace( c, '{{RELEASE}}', ( o ) ? ( o[ 0 ].version_added || '' ) : '' );
			tc.push( c );
		}
		// Render the row:
		row = replace( TMPL.TABLE_ROW, '{{HEADER}}', th );
		row = replace( row, '{{CELLS}}', tc.join( '\n' ) );

		rows.push( row );
	}
	return replace( TMPL.TABLE_BODY, '{{ROWS}}', rows.join( '\n' ) );
}


// MAIN //

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
	table = replace( TMPL.TABLE, '{{HEAD}}', head );
	table = replace( table, '{{BODY}}', body );

	// Wrap the table in a container element:
	return replace( TMPL.TABLE_CONTAINER, '{{TABLE}}', table );
}


// EXPORTS //

module.exports = renderCompat;
