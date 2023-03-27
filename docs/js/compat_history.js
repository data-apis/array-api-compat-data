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

/**
* Wrapper for enabling history timelines with a compatibility table.
*
* @private
*/
(function main() {
	'use strict';

	init();

	/**
	* Performs initialization tasks.
	*
	* @private
	*/
	function init() {
		addEventListeners();
	}

	/**
	* Adds event listeners to table support buttons.
	*
	* @private
	*/
	function addEventListeners() {
		var buttons;
		var el;
		var i;

		buttons = document.querySelectorAll( '.compat-wrapper .compat-support button' );
		for ( i = 0; i < buttons.length; i++ ) {
			el = buttons[ i ];
			el.addEventListener( 'click', toggleTimeline );
		}
	}

	/**
	* Callback invoked upon toggling a timeline.
	*
	* @private
	* @param {Object} event - event object
	* @returns {void}
	*/
	function toggleTimeline( event ) {
		var status;
		var cell;
		var html;
		var row;
		var el;

		// Prevent the event from bubbling further along in the DOM:
		event.stopPropagation();

		// Get the reference to the target element:
		el = event.target;

		// Get the table row:
		row = el.closest( 'tr' );

		// Get the parent table cell:
		cell = el.closest( 'td.compat-support' );

		// Resolve the history status:
		status = ( cell.getAttribute( 'aria-expanded' ) === 'true' ) ? true : false;
		status = !status;
		cell.setAttribute( 'aria-expanded', status.toString() );

		// If history is already shown, remove it...
		if ( status === false ) {
			row = row.nextSibling;
			if ( row.classList.contains( 'compat-history' ) ) {
				row.remove();
			}
			return;
		}
		// Get history HTML:
		html = cell.getAttribute( 'data-history' );
		if ( html === '' ) {
			return;
		}
		html = html.replace( '&quot;', '"' );

		// Insert a history element:
		row.insertAdjacentHTML( 'afterend', html );
	}
})();
