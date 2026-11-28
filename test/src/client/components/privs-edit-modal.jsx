/*
 * Copyright (C) 2026  Ansh Goyal
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

// eslint-disable-next-line import/no-unassigned-import
import '../../../test-helpers/setup';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {spy, stub} from 'sinon';
import PrivsEditModal from '../../../../src/client/components/pages/parts/privs-edit-modal';
import React from 'react';
import {expect} from 'chai';


const targetUser = {id: 2, name: 'editor', privs: 1, type: 'Editor'};

function renderModal() {
	const handleCloseModal = spy();
	const updateResultsOnPrivsChange = spy();
	render(
		<PrivsEditModal
			adminId={1}
			handleCloseModal={handleCloseModal}
			targetUser={targetUser}
			updateResultsOnPrivsChange={updateResultsOnPrivsChange}
		/>
	);
	return {handleCloseModal, updateResultsOnPrivsChange};
}

function changePrivilegesWithNote() {
	fireEvent.click(screen.getAllByRole('checkbox')[1]);
	fireEvent.change(screen.getByRole('textbox'), {target: {value: 'reason'}});
}

describe('PrivsEditModal', () => {
	let fetchStub;
	beforeEach(() => {
		fetchStub = stub(globalThis, 'fetch');
	});
	afterEach(() => {
		fetchStub.restore();
	});

	it('can only be saved once the privileges changed and a note is written', () => {
		renderModal();
		const save = screen.getByRole('button', {name: /save privileges/i});
		expect(save.disabled).to.be.true;
		fireEvent.click(screen.getAllByRole('checkbox')[1]);
		expect(save.disabled).to.be.true;
		fireEvent.change(screen.getByRole('textbox'), {target: {value: 'reason'}});
		expect(save.disabled).to.be.false;
	});

	it('saves the new privileges and closes', async () => {
		fetchStub.resolves(new Response('{}', {status: 200}));
		const {handleCloseModal, updateResultsOnPrivsChange} = renderModal();
		changePrivilegesWithNote();
		fireEvent.click(screen.getByRole('button', {name: /save privileges/i}));
		await waitFor(() => expect(handleCloseModal.calledOnce).to.be.true);
		expect(updateResultsOnPrivsChange.calledOnce).to.be.true;
		expect(JSON.parse(fetchStub.firstCall.args[1].body)).to.deep.equal({adminId: 1, newPrivs: 9, note: 'reason', oldPrivs: 1, targetUserId: 2});
	});

	it('shows the message of a failed save and stays open', async () => {
		fetchStub.resolves(new Response('{"error":"Not allowed"}', {status: 403}));
		const {handleCloseModal} = renderModal();
		changePrivilegesWithNote();
		fireEvent.click(screen.getByRole('button', {name: /save privileges/i}));
		expect(await screen.findByText('Not allowed')).to.exist;
		expect(handleCloseModal.called).to.be.false;
	});
});
