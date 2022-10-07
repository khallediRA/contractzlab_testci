import Stripe from "stripe";
import { KishiDataTypes, KishiModel, KishiModelAttributes, typesOfKishiAssociationOptions } from "../../sequelize";
import { StripeService, StripeHooks } from "../../services/stripe";


export class StripeChargeRecord extends KishiModel {
  static stripeHooks: StripeHooks = {
    "charge": async (eventType, event) => {
      if (!eventType.startsWith("charge"))
        return
      const charge = event.data.object as Stripe.Charge
      const { amount, id, customer, description, metadata, status } = charge
      let record
      record = await StripeChargeRecord.findByPk(id)
      if (record)
        await record.update({ status, amount, description })
      else {
        record = await StripeChargeRecord.create({ id, status, amount, description })
      }
      switch (eventType) {
        case "charge.updated":
          break;
        default:
          break;
      }
    }
  }
  static initialAttributes: KishiModelAttributes = {
    id: {
      type: KishiDataTypes.STRING(64),
      primaryKey: true,
    },
    status: KishiDataTypes.ENUM('failed', 'pending', 'succeeded'),
    amount: KishiDataTypes.INTEGER({ decimals: 8 }),
    description: KishiDataTypes.STRING(256),
  };
  static initialAssociations: { [key: string]: typesOfKishiAssociationOptions } = {
  };
}