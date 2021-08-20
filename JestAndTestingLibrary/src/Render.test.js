import React from "react";
import { render, screen } from "@testing-library/react";
import Render from "./Render";

describe("Rendering", () => {
  it("Should render all the elements correctly", () => {
    render(<Render />);
    // screen.debug();
    // screen.debug(screen.getByRole("heading"));
    expect(screen.getByRole("heading")).toBeTruthy();
    expect(screen.getByRole("textbox")).toBeTruthy();
    expect(screen.getAllByRole("button")[0]).toBeTruthy();
    expect(screen.getAllByRole("button")[1]).toBeTruthy();

    //textが存在するか探索->ない場合はエラーを返す
    expect(screen.getByText("test")).toBeTruthy();
    //ないことを確認
    expect(screen.queryByText("teeeest")).toBeNull();
    //idが存在するか
    expect(screen.getByTestId("test"));
  });
});
