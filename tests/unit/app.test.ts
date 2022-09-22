import { jest } from "@jest/globals";

import voucherService from "../../src/services/voucherService";
import voucherRepository from "../../src/repositories/voucherRepository";

jest.mock("../../src/repositories/voucherRepository");

describe("voucherService", () => {
  it("create voucher", async () => {
    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockImplementationOnce((): any => {});
    jest
      .spyOn(voucherRepository, "createVoucher")
      .mockImplementationOnce((): any => {});
    await voucherService.createVoucher("111", 10);
    expect(voucherRepository.createVoucher).toBeCalled();
    expect(voucherRepository.getVoucherByCode).toBeCalled();
  });
  it("Create duplicate voucher error", async () => {
    const vocuher = {
      code: "111",
      discount: 10,
    };
    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockImplementationOnce((): any => {
        return {
          code: vocuher.code,
          discount: vocuher.discount,
        };
      });

    const result = voucherService.createVoucher(vocuher.code, vocuher.discount);
    expect(result).rejects.toEqual({
      message: "Voucher already exist.",
      type: "conflict",
    });
  });

  it("Apply voucher", async () => {
    const voucher = {
      code: "111",
      discount: 10,
    };
    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockImplementationOnce((): any => {
        return {
          id: 1,
          code: voucher.code,
          discount: voucher.discount,
          used: false,
        };
      });
    jest
      .spyOn(voucherRepository, "useVoucher")
      .mockImplementationOnce((): any => {});
    const amount = 100;
    const result = await voucherService.applyVoucher(voucher.code, amount);
    expect(result.amount).toBe(amount);
    expect(result.discount).toBe(voucher.discount);
    expect(result.finalAmount).toBe((amount * (100 - voucher.discount)) / 100);
    expect(result.applied).toBe(true);
  });

  it("Apply voucher that dosent exist error", () => {
    const voucher = {
      code: "222",
      discount: 10,
    };
    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockImplementationOnce((): any => {});
    const amount = 100;
    const result = voucherService.applyVoucher(voucher.code, amount);
    expect(result).rejects.toEqual({
      message: "Voucher does not exist.",
      type: "conflict",
    });
  });

  it("Apply voucher for below 100 value error", async () => {
    const voucher = {
      code: "111",
      discount: 10,
    };
    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockImplementationOnce((): any => {
        return {
          id: 1,
          code: voucher.code,
          discount: voucher.discount,
          used: false,
        };
      });
    const amount = 99;
    const result = await voucherService.applyVoucher(voucher.code, amount);
    expect(result.amount).toBe(amount);
    expect(result.discount).toBe(voucher.discount);
    expect(result.finalAmount).toBe(amount);
    expect(result.applied).toBe(false);
  });

  it("Apply voucher for used voucher error", async () => {
    const voucher = {
      code: "111",
      discount: 10,
    };
    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockImplementationOnce((): any => {
        return {
          id: 1,
          code: voucher.code,
          discount: voucher.discount,
          used: true,
        };
      });
    const amount = 100;
    const result = await voucherService.applyVoucher(voucher.code, amount);
    expect(result.amount).toBe(amount);
    expect(result.discount).toBe(voucher.discount);
    expect(result.finalAmount).toBe(amount);
    expect(result.applied).toBe(false);
  });
});
