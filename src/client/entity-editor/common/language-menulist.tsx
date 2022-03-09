import React, {useEffect, useRef} from 'react';
import {MenuListProps} from 'react-select';
import ResizeObserver from 'resize-observer-polyfill';
import {Virtuoso} from 'react-virtuoso';


type ChildProps = {
    children:React.ReactNode,
};
// eslint-disable-next-line react/display-name
const InnerItem = React.memo(({children}:ChildProps) => <>{children}</>);

const getListHeight = (length) => (length < 6 ? length * 40 : 6 * 40);

const MenuList = ({options, children, getValue}:MenuListProps) => {
	const virtuosoRef = useRef(null);
	const [option] = getValue();
	const getInnerItem = (index) => <InnerItem>{children[index]}</InnerItem>;
	useEffect(() => {
		if (!window.ResizeObserver) { window.ResizeObserver = ResizeObserver; }
	}, []);

	useEffect(() => {
		if (virtuosoRef?.current) {
			let selectedOptionIndex = 0;

			if (option) {
				selectedOptionIndex = options.findIndex(
					(item) => item.value === option.value
				);
			}

			virtuosoRef.current.scrollToIndex({
				align: 'start',
				behavior: 'auto',
				index: selectedOptionIndex
			});
		}
	}, [children, virtuosoRef, options, option]);

	return Array.isArray(children) ? (
		<Virtuoso
			// eslint-disable-next-line react/jsx-no-bind
			itemContent={getInnerItem}
			overscan={{main: 12, reverse: 12}}
			ref={virtuosoRef}
			style={{height: `${getListHeight(children.length)}px`}}
			totalCount={children.length}
		/>
	) :
		<div>{children}</div>
	;
};
MenuList.displayName = 'MenuList';
export default MenuList;
