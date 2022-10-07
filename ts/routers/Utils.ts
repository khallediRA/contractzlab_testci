import { Router } from "express";

export let router = Router();
//file upload dependencies
import bodyParser from "body-parser";
import _ from "lodash";
import { ObjectToXML } from "../utils/object";

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

export class UtilsRouter {
  static Route(): Router {
    let router: Router = Router();
    router.post('/jsonToXML', async function (req, res, next) {
      res.status(200).contentType("xml").send(ObjectToXML(req.body))
    });
    return router;
  }
}
