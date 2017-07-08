import * as Influx from 'influx';

// Adapted from https://node-influx.github.io/manual/tutorial.html
function init(app, config) {
	const influx = new Influx.InfluxDB({
		database: config.database || 'bookbrainz',
		host: config.host || 'localhost',
		username: 'grafana',
		password: 'grafana',
		schema: [
			{
				fields: {
					duration: Influx.FieldType.INTEGER
				},
				measurement: 'response_times',
				tags: [
					'status',
					'path',
					'verb'
				]
			}
		]
	});

	app.use((req, res, next) => {
		const start = Date.now();

		res.on('finish', () => {
			const duration = Date.now() - start;

			const data = {
				fields: {duration},
				measurement: 'response_times',
				tags: {
					path: req.path, status: res.statusCode, verb: req.method
				}
			};

			console.log(JSON.stringify(data, null, 2));

			influx.writePoints([
				data
			]).catch(err => {
				console.error(`Error saving data to InfluxDB! ${err.stack}`);
			});
		});

		return next();
	});
}

export default init;
