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
import CollectionsTable from './parts/collections-table';
import PagerElement from './parts/pager';
import React from 'react';


type Props = WithTranslation & {
	editor?: {id: number} | null,
	entityTypes: string[],
	from?: number,
	nextEnabled: boolean,
	results?: unknown[],
	showIfOwnerOrCollaborator?: boolean,
	showLastModified?: boolean,
	showOwner?: boolean,
	showPrivacy?: boolean,
	size?: number,
	tableHeading?: string | null,
	type?: string | null,
	user?: Record<string, unknown> | null
};

type State = {
	querySearchParams: string,
	results: unknown[],
	type?: string | null
};

class CollectionsPage extends React.Component<Props, State> {
	static displayName = 'CollectionsPage';

	static defaultProps = {
		editor: null,
		from: 0,
		results: [],
		showIfOwnerOrCollaborator: false,
		showLastModified: false,
		showOwner: false,
		showPrivacy: false,
		size: 20,
		tableHeading: null,
		type: '',
		user: null
	};


	constructor(props: Props) {
		super(props);
		this.state = {
			querySearchParams: props.type ? `type=${props.type}` : '',
			results: this.props.results ?? [],
			type: props.type
		};
		this.handleTypeChange = this.handleTypeChange.bind(this);
		this.searchResultsCallback = this.searchResultsCallback.bind(this);
		this.paginationUrl = './collections/collections';
	}

	paginationUrl: string;

	searchResultsCallback(newResults: unknown[]) {
		this.setState({results: newResults});
	}

	handleTypeChange(type: string) {
		const querySearchParams = type ? `type=${type}` : '';
		this.setState({querySearchParams, type});
	}

	searchParamsChangeCallback = (searchParms: URLSearchParams) => {
		const type = searchParms.get('type') ?? '';
		if (type !== this.state.type) {
			this.setState({querySearchParams: `?${searchParms.toString()}`, type});
		}
	};

	render() {
		return (
			<div id="pageWithPagination">
				<CollectionsTable
					entityTypes={this.props.entityTypes}
					ownerId={this.props.editor ? this.props.editor.id : null}
					results={this.state.results}
					showIfOwnerOrCollaborator={this.props.showIfOwnerOrCollaborator}
					showLastModified={this.props.showLastModified}
					showOwner={this.props.showOwner}
					showPrivacy={this.props.showPrivacy}
					tableHeading={this.props.tableHeading ?? this.props.t('common.entityType.collection_plural')}
					type={this.state.type}
					user={this.props.user}
					onTypeChange={this.handleTypeChange}
				/>
				<PagerElement
					from={this.props.from}
					nextEnabled={this.props.nextEnabled}
					paginationUrl={this.paginationUrl}
					querySearchParams={this.state.querySearchParams}
					results={this.state.results}
					searchParamsChangeCallback={this.searchParamsChangeCallback}
					searchResultsCallback={this.searchResultsCallback}
					size={this.props.size}
				/>
			</div>
		);
	}
}
export default withTranslation()(CollectionsPage);
