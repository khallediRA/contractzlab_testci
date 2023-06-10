import { OpenAIService } from "../services/openAPI";

async function test() {
  const completion = await OpenAIService.ChatCompletion([{ role: "user", content: "Suggest one name for a horse." }], "gpt-4")
  console.log(completion);
}
test()