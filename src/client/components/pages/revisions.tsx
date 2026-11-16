/*
 * Copyright (C) 2020 Prabal Singh
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */


import {type WithTranslation, withTranslation} from 'react-i18next';
import PagerElement from './parts/pager';
import React from 'react';
import RevisionsTable from './parts/revisions-table';


type Props = WithTranslation & {
	from?: number,
	nextEnabled: boolean,
	results?: unknown[],
	showEntities?: boolean,
	showRevisionEditor?: boolean,
	size?: number
};

type State = {
	results: unknown[]
};

class RevisionsPage extends React.Component<Props, State> {
	static displayName = 'RevisionsPage';

	static defaultProps = {
		from: 0,
		results: [],
		showEntities: true,
		showRevisionEditor: true,
		size: 20
	};


	constructor(props: Props) {
		super(props);
		this.state = {
			results: this.props.results ?? []
		};

		// React does not autobind non-React class methods
		this.searchResultsCallback = this.searchResultsCallback.bind(this);
		this.paginationUrl = './revisions/revisions';
	}

	paginationUrl: string;

	searchResultsCallback(newResults: unknown[]) {
		this.setState({results: newResults});
	}

	render() {
		const {t: translate} = this.props;
		return (
			<div id="pageWithPagination">
				<RevisionsTable
					results={this.state.results}
					showEntities={this.props.showEntities}
					showRevisionEditor={this.props.showRevisionEditor}
					tableHeading={translate('pages.revisions.recentActivity')}
				/>
				<PagerElement
					from={this.props.from}
					nextEnabled={this.props.nextEnabled}
					paginationUrl={this.paginationUrl}
					results={this.state.results}
					searchResultsCallback={this.searchResultsCallback}
					size={this.props.size}
				/>
			</div>
		);
	}
}


export default withTranslation()(RevisionsPage);
