export class Metrics {
	constructor() {}

	receiver = null;

	async fetch(request: Request) {
		const url = new URL(request.url);
		if (url.pathname === '/provider') {
			let pair = new WebSocketPair();
			pair[1].accept();
			pair[1].addEventListener('message', (msg) => {
				if (this.receiver) {
					this.receiver.send(msg.data);
				}
			});
			return new Response(null, { status: 101, webSocket: pair[0] });
		} else if (url.pathname === '/receiver') {
			let pair = new WebSocketPair();
			pair[1].accept();
			this.receiver = pair[1];
			return new Response(null, { status: 101, webSocket: pair[0] });
		}
	}
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		return env.Metrics.get(env.Metrics.idFromName('gloabl-metrics')).fetch(request);
	},
};
