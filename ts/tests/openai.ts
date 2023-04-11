import { OpenAIService } from "../services/openAPI";

async function test() {
  const completion = await OpenAIService.Completion("Suggest one name for a horse.")
  console.log(completion);
}
test()