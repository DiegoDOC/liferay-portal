/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */

import '@testing-library/jest-dom/extend-expect';
import {cleanup, render} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import moment from 'moment';
import React from 'react';

import DatePicker from '../../../src/main/resources/META-INF/resources/DatePicker/DatePicker.es';

describe('DatePicker', () => {
	beforeEach(() => {
		fetch.mockResponseOnce(JSON.stringify({}));
	});

	afterEach(cleanup);

	it('has a helptext', () => {
		const {container} = render(
			<DatePicker tip="Type something" value="06/02/2020" />
		);

		expect(container.querySelector('.form-text')).toBeTruthy();
	});

	it('has a label', () => {
		const {container} = render(<DatePicker label="label" />);

		expect(container.querySelector('.ddm-label')).toBeTruthy();
	});

	it('has a predefinedValue', () => {
		const {container} = render(
			<DatePicker
				label="date"
				locale="en_US"
				localizedValue={{}}
				name="dateField"
				predefinedValue="2020-06-02"
			/>
		);

		const inputDatePicker = container
			.getElementsByClassName('form-control')
			.item(0);

		expect(inputDatePicker).toHaveValue('06/02/2020');
	});

	it('expands the datepicker when clicking the calendar icon', () => {
		const {container} = render(<DatePicker />);

		const btnDropdown = container.querySelector(
			'.date-picker-dropdown-toggle'
		);

		userEvent.click(btnDropdown);

		const dropdownDatePicker = document.body.querySelector(
			'.date-picker-dropdown-menu.show'
		);

		expect(dropdownDatePicker).toBeTruthy();
	});

	it('fills the input with the current date selected on Date Picker', () => {
		const onChange = jest.fn();

		const {container, getAllByDisplayValue, getByLabelText} = render(
			<DatePicker locale="en_US" name="dateField" onChange={onChange} />
		);

		const btnDropdown = container.querySelector(
			'.date-picker-dropdown-toggle'
		);

		userEvent.click(btnDropdown);
		userEvent.click(getByLabelText('Select current date'));

		const expectedDate = moment().format('MM/DD/YYYY');

		expect(onChange).toHaveBeenCalled();
		expect(getAllByDisplayValue(expectedDate)).toHaveLength(2);
	});

	it('call the onChange callback with a valid date', () => {
		const onChange = jest.fn();

		const {container, getAllByDisplayValue, getByLabelText} = render(
			<DatePicker locale="en_US" name="dateField" onChange={onChange} />
		);

		const btnDropdown = container.querySelector(
			'.date-picker-dropdown-toggle'
		);

		userEvent.click(btnDropdown);
		userEvent.click(getByLabelText('Select current date'));

		const displayDate = moment().format('MM/DD/YYYY');
		const formattedDate = moment().format('YYYY-MM-DD');

		expect(getAllByDisplayValue(displayDate)).toBeTruthy();
		expect(onChange).toHaveBeenCalledWith({}, formattedDate);
	});

	it('fills the input with the current date according to the locale', () => {
		const onChange = jest.fn();

		const {container, getAllByDisplayValue, getByLabelText} = render(
			<DatePicker locale="ja_JP" name="dateField" onChange={onChange} />
		);

		const btnDropdown = container.querySelector(
			'.date-picker-dropdown-toggle'
		);

		userEvent.click(btnDropdown);
		userEvent.click(getByLabelText('Select current date'));

		const displayDate = moment().format('MM/DD/YYYY');

		expect(getAllByDisplayValue(displayDate)).toBeTruthy();
	});

	it('fills the input completely when last item of a date mask is a symbol Ex: (YYYY.MM.DD.)', () => {
		const onChange = jest.fn();

		const {container} = render(
			<DatePicker
				defaultLanguageId="hu_HU"
				label="Field date"
				locale="hu_HU"
				onChange={onChange}
			/>
		);

		const input = container.querySelector('[type=text]');

		userEvent.type(input, '1111.11.11.');

		expect(input).toHaveValue('1111.11.11.');
	});
});
