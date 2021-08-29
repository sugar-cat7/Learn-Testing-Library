import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { rest } from "msw";
import { setupServer } from "msw/node";

import MockServer from "./MockServer";
import { expect } from "@jest/globals";

const server = setupServer(
  rest.get("https://jsonplaceholder.typicode.com/users/1", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ username: "Bred dummy" })); //擬似的なAPIのエンドポイントを定義できる
  })
);

beforeAll(() => server.listen()); //サーバーを起動しておく必要がある　beforeAllはテストファイルの最初に実行される
afterEach(() => {
  server.resetHandlers();
  cleanup();
}); //テストケース毎
afterAll(() => server.close()); //最後に実行される

describe("Mocking API", () => {
  it("[Fetch success]Should display data correctly and button disable", async () => {
    render(<MockServer />);
    userEvent.click(screen.getByRole("button"));
    expect(await screen.findByText("Bred dummy")).toBeInTheDocument();
    expect(screen.getByRole("button")).toHaveAttribute("disabled");
  });
  it("[Fethch failure]Should display error msg, no render heading and button abled", async () => {
    server.use(
      rest.get(
        "https://jsonplaceholder.typicode.com/users/1",
        (req, res, ctx) => {
          return res(ctx.status(404)); //擬似的なAPIのエンドポイントを定義できる
        }
      )
    );
    render(<MockServer />);
    userEvent.click(screen.getByRole("button"));
    expect(await screen.findByTestId("error")).toHaveTextContent(
      "Fetching Failed"
    );
    expect(screen.queryByRole("heading")).toBeNull();
    expect(screen.getByRole("button")).not.toHaveAttribute("disabled");
  });
});
