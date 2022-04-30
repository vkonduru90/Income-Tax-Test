const Joi = require('joi');
const moment = require('moment');
const taxRates = [
    {
        from: 0,
        to: 18200,
        tax: 0
    },
    {
        from: 18201,
        to: 37000,
        tax: 0.19
    },
    {
        from: 37001,
        to: 87000,
        tax: 0.325
    },
    {
        from: 87001,
        to: 180000,
        tax: 0.37
    },
    {
        from: 180001,
        to: undefined,
        tax: 0.45
    },
]

async function caliculateTax(req, res) {
    const body = req.body;
    try {
        const errors = validateRequest(body);
        if (errors.error) {
            return res.status(400).json(errors);
        }
    } catch (e) {
        return res.status(400).json({ success: false, message: e.message });
    }
    const gross_income = body.annual_salary / 12;
    const output = {
        name: `${body.first_name} ${body.last_name}`,
        pay_period: `${moment(body.payment_start_date).startOf('month').format('DD MMMM')} - ${moment(body.payment_start_date).endOf('month').format('DD MMMM')}`,
        gross_income: Math.round(gross_income),
        income_tax: 0,
        net_income: 0,
        super_amount: Math.round((gross_income * body.super_rate)/100)
    }
    const taxToApply = taxRates.filter(tax => tax.from <= body.annual_salary);
    let taxableAmt = body.annual_salary;
    let tax = 0;
    taxToApply.forEach(t => {
        const taxAmt = t.to - t.from;
        if (taxableAmt > taxAmt) {
            taxableAmt = taxableAmt - taxAmt;
            tax = tax + (taxAmt * t.tax);
        } else {
            tax = tax + (taxableAmt * t.tax);
        }
    });
    output.income_tax = Math.round(tax/12);
    output.net_income = Math.round(gross_income - tax/12);
    return res.status(200).json(output);
}

function validateRequest(body) {
    const schema = Joi.object({
        first_name: Joi.string()
            .min(3)
            .max(30)
            .required(),

        last_name: Joi.string()
            .min(3)
            .max(30)
            .required(),


        annual_salary: Joi.number()
            .integer()
            .min(5000),

        super_rate: Joi.number()
            .integer()
            .min(1),

        payment_start_date: Joi.date()
    })
    try {
        return schema.validate(body);
    } catch (e) {
        console.log(e);
        throw e;
    }
}

module.exports = {
    caliculateTax
}