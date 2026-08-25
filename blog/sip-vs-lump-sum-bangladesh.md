---
title: Monthly investing or one lump sum? What happened in each tracked fund
slug: sip-vs-lump-sum-bangladesh
description: We ran the same window both ways across every fund we track and counted which approach came out ahead, fund by fund.
published: 2026-08-25
live: true
---

The usual advice is that investing monthly protects you from bad timing. The usual counter is that markets rise more often than they fall, so putting money in earlier tends to win. Both arguments are reasonable and neither settles anything.

We can just count.

## The count

Across {{LUMPSIP_TOTAL}} funds over {{RANK_WIN_LABEL}}, a single lump sum at the start produced the higher annualised result in {{LUMP_BETTER_COUNT}} funds. Monthly investing produced the higher result in {{SIP_BETTER_COUNT}}.

> Over this particular window, monthly investing came out ahead in the large majority of funds. That is a fact about this window, not a law.

What drives that outcome is the shape of the period, not the merit of either method.

A lump sum wins when a fund's NAV rises steadily from the day you invest, because every taka is exposed for the whole window. Monthly investing wins when the NAV dips partway through, because the later instalments buy units at the lower price.

So the {{SIP_BETTER_COUNT}} to {{LUMP_BETTER_COUNT}} split is a description of the last {{RANK_WIN_LABEL}} in these funds. Run the same test across a window whose NAV path rose without interruption and the tally reverses.

## The comparison nobody runs

Treating this as a real choice assumes a lump sum exists. For most savers it does not: income arrives monthly, and the actual decision is whether to buy units as the money arrives or hold it in a bank account until it accumulates.

That version of the question has a cost the table above cannot show. Money waiting to be invested earns the deposit rate, currently around {{BENCH_FDR}}% a year on an FDR, while it waits. Against the {{RANK_TOP_ANN}}% the strongest fund produced and the {{RANK_LAST_ANN}}% the weakest produced, waiting is neither obviously safe nor obviously costly. It depends entirely on which fund the money was eventually going to buy.

## What the monthly figures assume

A fixed deposit of BDT {{SIP_MONTHLY}} on a regular schedule, units bought at the NAV in force at the time, dividends reinvested. The full table of what that produced in each fund is in [the monthly investing post](/blog/bdt-5000-a-month-every-bangladeshi-mutual-fund.html).

Over {{RANK_WIN_LABEL}} that adds up to BDT {{SIP5K_INVESTED}} paid in. The strongest result was {{SIP5K_BEST}} at BDT {{SIP5K_BEST_VALUE}}; the weakest was {{SIP5K_WORST}} at BDT {{SIP5K_WORST_VALUE}}.

Notice which comparison is larger. The gap between the best and worst fund is far bigger than the gap between the two methods. Choosing the fund mattered more than choosing how to pay into it.

## What is not modelled

No tax, no platform charge, no spread between the buying and selling price. The fund's management fee is inside the NAV, so it is reflected. Figures run through {{ASOF}}.

:::faq
Q: Which method is better overall?
A: Neither, universally. Over this window monthly investing led in {{SIP_BETTER_COUNT}} of {{LUMPSIP_TOTAL}} funds, but the result depends on the shape of the period rather than on one method being superior.

Q: Does monthly investing reduce risk?
A: It spreads out the price you pay, which reduces the impact of investing everything on a single bad day. It does not protect against a fund falling over the whole period.

Q: What monthly amount is modelled?
A: BDT {{SIP_MONTHLY}}, applied identically to every fund so the results stay comparable. You can run a different figure on the homepage.

Q: Does the choice of fund matter more than the method?
A: On this evidence, yes. The spread between the strongest and weakest fund was BDT {{SIP5K_SPREAD}} on identical deposits, which is a far larger difference than the one between the two methods.
:::
