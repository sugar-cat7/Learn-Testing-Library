### Lerning Testing Library + Jest

- Testing Library はデフォルトで入っている

### test の書き方(Unit Test)

- 基本的には`describe it`
- render test

```js
//Render component
import React from "react";

const Render = () => {
  return (
    <div>
      <h1>React Testing Library</h1>
      <input type="text" />
      <button>Click1</button>
      <button>Click2</button>
      <p>test</p>
      <span data-testid="test">@React</span>
    </div>
  );
};

export default Render;

//Render.test
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
```

- test の結果にテストケースの名前を表示させる
  package.json の script に`--env=jsdom --verbose`追記

```json
  "scripts": {
    "test": "react-scripts test --env=jsdom --verbose",
  },
```

### userEvent

- RenderInput

```js
//renderInputのテスト
//渡される関数をモック関数としてその部分だけをテストする

import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RenderInput from "./RenderInput";

//各テストケース後に処理を行う場合ー＞afterEach
//itが複数ある場合でレンダリングの処理を行う場合、cleanupするとレンダリングされているコンポーネントをアンマウントしてくれる(副作用の排除などが目的)
afterEach(() => cleanup());

//レンダリングされているかのテスト
describe("Rendering", () => {
  it("Should render all the elements collectly", () => {
    render(<RenderInput />);
    expect(screen.getByRole("button")).toBeTruthy();
    expect(screen.getByPlaceholderText("Enter")).toBeTruthy();
  });
});

//フォームに値が入力されているかのテスト
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

//値入力後の挙動のテスト
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
```

- ListComponent テスト
  ダミーデータを用意して比較する

```js
import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import FrameworkList from "./FrameworkList";

afterEach(() => cleanup());

describe("Rendering the list with props", () => {
  it("should render nodata ! when no data propped", () => {
    render(<FrameworkList />);
    expect(screen.getByText("No data!")).toBeInTheDocument();
  });
  it("Should render list item correctly", () => {
    const dummyData = [
      { id: 1, item: "React dummy" },
      { id: 2, item: "Angular dummy" },
      { id: 3, item: "Vue dummy" },
    ];
    render(<FrameworkList frameworks={dummyData} />);
    const frameworkItems = screen
      .getAllByRole("listitem")
      .map((ele) => ele.textContent);
    const dummyItems = dummyData.map((ele) => ele.item);
    expect(frameworkItems).toEqual(dummyItems);
    expect(screen.queryByText("No data")).toBeNull();
  });
});
```

- useEffect

  レンダリングの遅れをテストする。→async await で Text を見つけるようにすれば良い
  /hoge/で部分一致

```js
describe("useEffect rendring", () => {
  it("Should render only after async fuction resolved", async () => {
    render(<UseEffectRender />);
    expect(screen.queryByText(/I am/)).toBeNull();
    expect(await screen.findByText(/I am/)).toBeInTheDocument();
  });
});
```

- Mock
  you need `msw`

```js
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";
import { setupServer } from "msw/node";
import MockServer from "./MockServer";

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
```
