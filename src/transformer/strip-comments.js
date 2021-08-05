// @ts-check
import { isComment } from '../token-util.js';

export class StripCommentsTransformer {
	transformAction(token) {
		return isComment(token) ? undefined : token;
	}
}
