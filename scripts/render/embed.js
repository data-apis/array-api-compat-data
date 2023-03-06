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
var TMPL = require( './../templates' );
var renderCompat = require( './compat.js' );


// MAIN //

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
	var d;

	// Get the API name:
	name = objectKeys( data )[ 0 ];
	d = data[ name ];

	// Check whether the API satisfies version constraints:
	if ( maxVersion !== '*' && d.__compat.version_added > maxVersion ) {
		return null;
	}
	// Render compatibility data:
	out = replace( TMPL.COMPAT_WRAPPER_EMBED, '{{TABLE}}', renderCompat( d, name, maxVersion ) );
	out = replace( out, '{{LEGEND}}', TMPL.LEGEND );

	return out;
}


// EXPORTS //

module.exports = render;
