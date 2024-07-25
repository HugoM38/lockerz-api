import Joi from "joi";

export const createReservationSchema = Joi.object({
    lockerId: Joi.string().required(),
    members: Joi.array().required()
});