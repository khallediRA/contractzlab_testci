import axios from "axios";
import { config } from "../config";
import { IContract, IContractTemplate } from "../views";

async function test() {
  const { admin } = config
  const url = "http://127.0.0.1:4001/auth/SignIn"
  const res = await axios.post(url, admin)
  console.log(res.data.token);
  const headers = {
    "user-token": res.data.token
  }
  const data: IContractTemplate = {
    language: "en",
    name: "template name",
    level3: {
      name: "level3",
      level2: {
        name: "level2", level1: { name: "level1" }
      }
    },
    clauses: [{
      ContractTemplate_Clause: {
        index: 1,
      },
      name: "Clause name",
      isOptional: false,
      subClauses: [
        {
          Clause_SubClause: {
            index: 1,
          },
          name: "sub clause name",
          isOptional: false,
          rawText: ["$firstName $lastName born on $birthDate"],
          params: {
            "firstName": "text",
            "lastName": "text",
            "birthDate": "date",
          }
        }
      ]
    }]
  }
  const res2 = await axios.post("http://127.0.0.1:4001/ContractTemplate", { data }, { headers })
  console.log(res2.data);
}
test()