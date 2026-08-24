---
title: What total return actually means, and why our numbers differ from the AMC's
slug: what-total-return-actually-means
description: A fund's NAV drops when it pays a dividend. Judge it on NAV alone and you punish the funds that paid you the most. Here is the arithmetic, worked through by hand.
published: 2026-08-25
live: true
---

If you have ever compared a return figure on ReturnKoto? against one published by the fund manager and found they disagree, this page explains why. Usually neither number is wrong. They are answering different questions.

## The problem in one sentence

When a fund pays out a cash dividend, its NAV falls by roughly the amount paid.

That is not a loss. The money left the fund and arrived in your account. But it means the NAV chart alone tells a misleading story: the fund that paid you generously looks worse than the fund that paid you nothing, purely because paying you showed up as a drop.

> Measuring a fund on NAV movement alone quietly penalises exactly the funds that returned the most cash to their investors.

Total return fixes this by counting both parts of what you received: the change in NAV, and the dividends. That is the number this site publishes.

## Working one through by hand

Say you put BDT 1,00,000 into a fund when its NAV was 10.00. That buys 10,000 units.

The fund then declares a 10% cash dividend. On a face value of BDT 10 per unit, that is BDT 1 per unit, so your 10,000 units pay out BDT 10,000. The NAV drops by about the same BDT 1, to roughly 9.00, because the fund genuinely holds less now.

If you look only at NAV, you have gone from 10.00 to 9.00 and appear to be down 10%. You are not. You are holding units worth BDT 90,000 plus BDT 10,000 in cash. You are exactly level.

Now reinvest that BDT 10,000 at a NAV of 11.00 and you buy another 909.09 units, taking you to 10,909.09 units. If the NAV later reaches 12.00, your holding is worth BDT 1,30,909. That is a total return of 30.9% on your original BDT 1,00,000, and no NAV chart on its own would have shown it to you.

## Reinvested or taken as cash

Both are legitimate, and ReturnKoto? will show you either.

Reinvested is the default, because it answers the question most people actually mean: what would my money have become if I left it alone. Dividends buy more units, those units earn their own dividends, and the effect compounds.

Taken as cash answers a different question: what if I spent every payout as it arrived. The money is still counted, it just stops compounding. Over a year or two the two figures sit close together, because dividends have barely had time to compound. Over a long horizon the gap becomes large, and the reinvested figure can be meaningfully higher.

Neither is the "real" number. They are two honest answers to two different questions, which is why the site lets you switch between them rather than picking for you.

## Why an AMC's published figure can still differ

Even with the same underlying NAV history, two correct calculations can disagree, usually for one of these reasons.

The window is different. A return "since inception" depends entirely on when inception was, and a fund quoting its best window is not lying, it is selecting.

The dividend treatment is different. Some published figures assume reinvestment, some do not, and some are silent about which.

The starting basis is different. A figure anchored to a fund's face value at launch is a different measurement from one anchored to the first NAV print we can verify.

None of these make anyone dishonest. They make comparison hard, which is the entire reason a site like this exists: one method, applied identically to all {{FUND_COUNT}} funds, so the differences you see are differences between funds rather than differences between accounting choices.

## What we do not model

Worth being direct about the limits.

The fund's own management fee is already inside the NAV, so it is genuinely reflected in every figure here. Taxes are not modelled. Neither is the spread between a fund's buying and selling price, nor any fee your platform adds on top. Those are real costs, and they mean a live result would come in slightly below the figure shown.

Dividends are modelled at a fixed annual point rather than on each fund's exact ex-dividend date, which can make a mid-year payout look slightly out of step for a few weeks. NAV history runs through {{ASOF}}.

:::faq
Q: Why does the fund's own website show a different return than ReturnKoto?
A: Most often because the window, the dividend treatment or the starting basis differs. All three can be correct at once and still produce different numbers. The value of comparing here is that the same method is applied to every fund.

Q: Is total return the same as CAGR?
A: No. Total return is the whole gain over a period. CAGR, or annualised return, spreads that gain evenly across the years so periods of different lengths can be compared. A fund that gained 30% over three years did not gain 30% a year.

Q: Does a falling NAV always mean the fund lost money?
A: No. If the drop lines up with a dividend payment, the money moved to you rather than disappearing. That is exactly the case total return is designed to capture.

Q: Which basis should I use, reinvested or cash?
A: Use reinvested if you want to know what leaving the money alone would have produced, which is what most people mean. Use cash if you plan to spend the payouts. The site defaults to reinvested and lets you switch.

Q: Are these figures net of fees?
A: They are net of the fund's management fee, because that is deducted inside the NAV. They are not net of tax, platform charges or buy and sell spreads.
:::
