/*
 * Copyright (C) 2018 Shivam Tripathi
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

import ImportCreatorRouter from './creator';
import ImportEditionRouter from './edition';
import ImportPublicationRouter from './publication';
import ImportPublisherRouter from './publisher';
import ImportRecentRouter from './recent';
import ImportWorkRouter from './work';
import express from 'express';


const importRouter = express.Router();

importRouter.use('/creator', ImportCreatorRouter);
importRouter.use('/edition', ImportEditionRouter);
importRouter.use('/publisher', ImportPublisherRouter);
importRouter.use('/publication', ImportPublicationRouter);
importRouter.use('/work', ImportWorkRouter);
importRouter.use('/recent', ImportRecentRouter);

export default importRouter;
