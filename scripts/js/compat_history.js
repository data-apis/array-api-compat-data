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

		buttons = document.querySelectorAll( '.compat-wrapper .compat-support button[data-live="false"]' );
		for ( i = 0; i < buttons.length; i++ ) {
			el = buttons[ i ];
			el.addEventListener( 'click', toggleTimeline );
			el.setAttribute( 'data-live', 'true' );
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

		// Toggle the history status:
		status = ( cell.getAttribute( 'aria-expanded' ) === 'true' ) ? 'false' : 'true';

		// If history is already shown, remove it...
		if ( status === 'false' ) {
			row = row.nextElementSibling;
			if ( row.classList.contains( 'compat-history' ) ) {
				row.remove();
			}
			cell.setAttribute( 'aria-expanded', status );
			return;
		}
		// Remove any displayed timelines:
		collapseAll( el.closest( 'table.compat-table' ) );

		// Get history HTML:
		html = cell.getAttribute( 'data-history' );
		if ( html === '' ) {
			return;
		}
		html = html.replace( '&quot;', '"' );

		// Insert a history element:
		row.insertAdjacentHTML( 'afterend', html );

		// Update the ARIA attribute:
		cell.setAttribute( 'aria-expanded', status );
	}

	/**
	* Removes all timelines in a table.
	*
	* @private
	* @param {DOMElement} table - DOM element
	*/
	function collapseAll( table ) {
		var status;
		var cells;
		var list;
		var row;
		var sib;
		var i;
		var j;

		list = table.querySelectorAll( 'tr.compat-history' );
		for ( i = 0; i < list.length; i++ ) {
			row = list[ i ];

			// Get the previous row:
			sib = row.previousElementSibling;

			// Remove the timeline:
			row.remove();

			// Find any cells which indicate that their timelines are expanded:
			cells = sib.querySelectorAll( 'td[aria-expanded="true"]' );

			// Update the ARIA attribute for each cell:
			for ( j = 0; j < cells.length; j++ ) {
				cells[ i ].setAttribute( 'aria-expanded', 'false' );
			}
		}
	}
})();
