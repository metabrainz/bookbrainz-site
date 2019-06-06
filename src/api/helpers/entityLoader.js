import * as commonUtils from '../../common/helpers/utils';


export function makeEntityLoader(modelName, relations, errMessage) {
	return async (req, res, next) => {
		const {orm} = req.app.locals;
		if (commonUtils.isValidBBID(req.params.bbid)) {
			try {
				const entityData = await orm.func.entity.getEntity(orm, modelName, req.params.bbid, relations);
				res.locals.entity = entityData;
				return next();
			}
			catch (err) {
				return res.status(404).send({message: errMessage});
			}
		}
		return res.status(406).send({message: 'BBID is not valid uuid'});
	};
}
