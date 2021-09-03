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

import ClayDatePicker from '@clayui/date-picker';
import moment from 'moment/min/moment-with-locales';
import React, {useMemo, useRef, useState} from 'react';
import {createAutoCorrectedDatePipe} from 'text-mask-addons';
import {conformToMask} from 'vanilla-text-mask';

import {FieldBase} from '../FieldBase/ReactFieldBase.es';

const DIGIT_REGEX = /\d/;
const LETTER_REGEX = /[a-z]/i;
const NON_NUMERIC_REGEX = /[\D]/g;

const getInitialMonth = (value) => {
	if (moment(value).isValid()) {
		return moment(value).toDate();
	}

	return moment().toDate();
};

const getValueForHidden = (value, locale) => {
	const momentLocale = moment().locale(locale);
	const momentLocaleFormatted = momentLocale.localeData().longDateFormat('L');
	const newMoment = moment(value, momentLocaleFormatted, true);

	return newMoment.isValid()
		? newMoment.locale('en').format('YYYY-MM-DD')
		: '';
};

const Months = [
	Liferay.Language.get('january'),
	Liferay.Language.get('february'),
	Liferay.Language.get('march'),
	Liferay.Language.get('april'),
	Liferay.Language.get('may'),
	Liferay.Language.get('june'),
	Liferay.Language.get('july'),
	Liferay.Language.get('august'),
	Liferay.Language.get('september'),
	Liferay.Language.get('october'),
	Liferay.Language.get('november'),
	Liferay.Language.get('december'),
];

const WeekdayShort = [
	Liferay.Language.get('weekday-short-sunday'),
	Liferay.Language.get('weekday-short-monday'),
	Liferay.Language.get('weekday-short-tuesday'),
	Liferay.Language.get('weekday-short-wednesday'),
	Liferay.Language.get('weekday-short-thursday'),
	Liferay.Language.get('weekday-short-friday'),
	Liferay.Language.get('weekday-short-saturday'),
];

const DatePicker = ({
	defaultLanguageId,
	locale,
	localizedValue,
	name,
	onChange,
	predefinedValue,
	readOnly,
	value: initialValue = predefinedValue,
	...otherProps
}) => {
	const inputRef = useRef(null);

	const [expanded, setExpand] = useState(false);

	const dateFormat = useMemo(() => {
		const currentLocale =
			localizedValue?.[locale] === undefined ? defaultLanguageId : locale;

		moment.locale(currentLocale);

		return moment.localeData().longDateFormat('L');
	}, [defaultLanguageId, locale, localizedValue]);
	const initialFormattedDate = useMemo(
		() =>
			!initialValue || initialValue.includes('_')
				? ''
				: moment(initialValue).format(dateFormat),
		[dateFormat, initialValue]
	);

	const [inputValue, setInputValue] = useState(initialFormattedDate);
	const [years, setYears] = useState(() => {
		const currentYear = new Date().getFullYear();

		return {
			end: currentYear + 5,
			start: currentYear - 5,
		};
	});

	const maskedDate = useMemo(() => {
		const mask = [];

		for (let i = 0; i < dateFormat.length; i++) {
			if (LETTER_REGEX.test(dateFormat[i])) {
				mask.push(DIGIT_REGEX);
			}
			else {
				mask.push(`${dateFormat[i]}`);
			}
		}

		const {conformedValue} = conformToMask(inputValue, mask, {
			guide: false,
			keepCharPositions: false,
			pipe: createAutoCorrectedDatePipe(dateFormat.toLowerCase()),
			placeholderChar: '\u2000',
			showMask: true,
		});

		return conformedValue;
	}, [dateFormat, inputValue]);

	const handleNavigation = (date) => {
		const currentYear = date.getFullYear();

		setYears({
			end: currentYear + 5,
			start: currentYear - 5,
		});
	};

	const handleChange = (value, eventType) => {
		const inputValueRaw = inputValue.replace(NON_NUMERIC_REGEX, '');
		const rawValue = value.replace(NON_NUMERIC_REGEX, '');
		if (inputValueRaw.length === rawValue.length) {
			value = value.slice(0, -1);
		}

		setInputValue(value);

		if (eventType === 'click') {
			setExpand(false);
			inputRef.current.focus();
		}

		if (moment(value, dateFormat, true).isValid()) {
			onChange({}, getValueForHidden(value, locale));
		}
		else if (initialValue !== '') {
			onChange({}, '');
		}
	};

	return (
		<FieldBase
			{...otherProps}
			localizedValue={localizedValue}
			name={name}
			readOnly={readOnly}
		>
			<input name={name} type="hidden" value={initialValue} />
			<ClayDatePicker
				aria-labelledby={name + '_fieldDetails'}
				dateFormat={dateFormat
					.replace('DD', 'dd')
					.replace('YYYY', 'yyyy')}
				disabled={readOnly}
				expanded={expanded}
				initialMonth={getInitialMonth(inputValue)}
				months={Months}
				onExpandedChange={(expand) => {
					setExpand(expand);
				}}
				onNavigation={handleNavigation}
				onValueChange={handleChange}
				ref={inputRef}
				value={maskedDate}
				weekdaysShort={WeekdayShort}
				years={years}
			/>
		</FieldBase>
	);
};

export default DatePicker;
