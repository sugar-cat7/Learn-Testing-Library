//renderInputのテスト
//渡される関数をモック関数としてその部分だけをテストする

import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RenderInput from "./RenderInput";

//各テストケース後に処理を行う場合ー＞afterEach
//itが複数ある場合でレンダリングの処理を行う場合、cleanupするとレンダリングされているコンポーネントをアンマウントしてくれる(副作用の排除などが目的)
afterEach(() => cleanup());

describe("Rendering", () => {
  it("Should render all the elements collectly", () => {
    //レンダリングされているかのテスト
    render(<RenderInput />);
    expect(screen.getByRole("button")).toBeTruthy();
    expect(screen.getByPlaceholderText("Enter")).toBeTruthy();
  });
});

describe("input form onChange event", () => {
  it("Should updare input value correctly", () => {
    render(<RenderInput />);
    const inputValue = screen.getByPlaceholderText("Enter");
    //ユーザーがtestと打つことをシミュレートできる
    userEvent.type(inputValue, "test");
    //この場合,inputフォームに対してtestと打つ→ならばupdateEventを通じてvalueの値も上書きされているはず
    expect(inputValue.value).toBe("test");
  });
});

describe("console button conditionally triggered", () => {
  it("Should not trigger output function", () => {
    //jest.fn() 関数が呼び出されるか呼び出されないかをテスト
    const outputConsole = jest.fn();
    render(<RenderInput outputConsole={outputConsole} />);
    userEvent.click(screen.getByRole("button"));
    expect(outputConsole).not.toHaveBeenCalled();
  });

  it("Should trigger output function", () => {
    const outputConsole = jest.fn();
    render(<RenderInput outputConsole={outputConsole} />);
    const inputValue = screen.getByPlaceholderText("Enter");
    userEvent.type(inputValue, "test");
    userEvent.click(screen.getByRole("button"));
    expect(outputConsole).toHaveBeenCalledTimes(1);
  });
});
