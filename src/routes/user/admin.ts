import type { Request, Response } from "express";
import { ApiRoute, ApplyOptions } from "../../lib/Api/index.js";
import jwt from "jsonwebtoken";

@ApplyOptions({
	methods: "POST"
})
export default class extends ApiRoute {
	private admins = ["304986851310043136", "707741882435764236", "176622552804884490"];

	public override run(req: Request, res: Response) {
		const { authorization } = req.headers;
		if (typeof authorization !== "string") {
			res.send({ token: "" });
			return;
		}

		const [type, _token] = authorization.split(/ +/g);
		if (type !== "User") {
			res.send({ token: "" });
			return;
		}

		const token = jwt.verify(_token, this.server.config.config.encryptionKey);
		if (typeof token !== "object" || typeof token.session !== "string" || typeof token.userId !== "string") {
			res.send({ token: "" });
			return;
		}

		const session = this.server.data.getSession(token.session, token.userId);
		if (!session || session.session.expirationDate.getTime() <= Date.now() || !this.admins.includes(session.user.userId)) {
			res.send({ token: "" });
			return;
		}

		const csrfToken = this.server.jwt.generateCsrfToken();
		res.status(200).send(csrfToken);
	}
}
