import * as Influx from 'influx';
import log from 'log';

// Adapted from https://node-influx.github.io/manual/tutorial.html
function init(app, config) {
	const influxConfig = config.influx;

	const influx = new Influx.InfluxDB({
		database: influxConfig.database || 'bookbrainz',
		host: influxConfig.host || 'localhost',
		password: 'grafana',
		schema: [
			{
				fields: {
					duration: Influx.FieldType.INTEGER
				},
				measurement: 'response_times',
				tags: [
					'domain',
					'path',
					'status',
					'verb'
				]
			}
		],
		username: 'grafana'
	});

	app.use((req, res, next) => {
		const start = Date.now();

		res.on('finish', () => {
			const duration = Date.now() - start;

			const data = {
				fields: {duration},
				measurement: 'response_times',
				tags: {
					domain: influxConfig.domain || 'localhost',
					path: req.path,
					status: res.statusCode,
					verb: req.method
				}
			};

			influx.writePoints([
				data
			]).catch(err => {
				log.error(`Error saving data to InfluxDB! ${err.stack}`);
			});
		});

		return next();
	});
}

export default init;
