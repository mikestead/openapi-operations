import getOperations from "../src/index";
import { spec1, operationSchema } from "./fixtures";
import { Validator } from "jsonschema";

const validator = new Validator();

test("should collect operations", () => {
  const ops = getOperations(spec1);
  expect(ops.length).toBe(1);

  const op = ops[0];
  const result = validator.validate(op, operationSchema);
  expect(result.errors).toEqual([]);

  expect(op.id).toBe("getAccount");
  expect(op.operationId).toBeUndefined();
  expect(op.group).toBe("account");
  expect(op.path).toBe("/accounts/{id}");
  expect(op.basePath).toBe("/v1");
  expect(op.fullPath).toBe("/v1/accounts/{id}");
  expect(op.description).toBe("Get the details of an account");
  expect(op.parameters.length).toBe(2);

  const param = op.parameters[0];
  expect(param.name).toBe("id");
  expect(param.in).toBe("body");
  expect(param.type).toBe("string");
  expect(param.required).toBeTruthy();
});
