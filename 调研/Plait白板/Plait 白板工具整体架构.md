# Plait 白板工具整体架构

Plait 是一个现代化的绘图框架，基于插件机制设计，可用于构建思维导图、流程图等一体化白板工具。其底层提供基础画布能力（如缩放、平移），而具体业务功能通过插件实现 ([GitHub - plait-board/x-plait: A completely customizable framework for building all-in-one drawing whiteboards](https://github.com/plait-board/x-plait#:~:text=,Basic%20drawing%20tool%20functions)) ([0–1 Create a modern drawing framework | by pubuzhixing | Medium](https://pubuzhixing.medium.com/0-1-create-a-modern-drawing-framework-9b3622466213#:~:text=1,Overwriable%20Rendering%20%28Controlling%20Rendering))。总体架构可以分为以下核心模块：

- **数据层（Data Layer）**：基于不可变数据模型（类似 Slate 的模型），使用 Immer 实现状态管理。数据以树结构形式存储，每个节点为 `PlaitElement` 类型，包含 `type`、`id`、位置坐标、样式属性以及子元素列表等 ([0–1 Create a modern drawing framework | by pubuzhixing | Medium](https://pubuzhixing.medium.com/0-1-create-a-modern-drawing-framework-9b3622466213#:~:text=1,can%20be%20intercepted%20and%20processed))。这个层负责管理白板上所有元素的数据并提供原子级别的变更（Transforms）函数，以便增删改元素。 ([GitHub - plait-board/x-plait: A completely customizable framework for building all-in-one drawing whiteboards](https://github.com/plait-board/x-plait#:~:text=Package%20Name%20Description%20%40plait%2Fcore%20Core,Basic%20tool)) ([0–1 Create a modern drawing framework | by pubuzhixing | Medium](https://pubuzhixing.medium.com/0-1-create-a-modern-drawing-framework-9b3622466213#:~:text=1,can%20be%20intercepted%20and%20processed))

- **渲染层（Rendering Layer）**：采用 SVG 作为绘图方案，并集成了 RoughJS 库进行手绘风格渲染 ([0–1 Create a modern drawing framework | by pubuzhixing | Medium](https://pubuzhixing.medium.com/0-1-create-a-modern-drawing-framework-9b3622466213#:~:text=Canvas%20or%20SVG,would%20try%20this%20solution%20first)) ([0–1 Create a modern drawing framework | by pubuzhixing | Medium](https://pubuzhixing.medium.com/0-1-create-a-modern-drawing-framework-9b3622466213#:~:text=,party%20drawing%20library%20roughjs))。SVG 画布负责绘制所有图形元素和线条，同时可通过嵌入 `<foreignObject>` 来容纳富文本或 React DOM 元素，实现 HTML 内容与 SVG 绘制的并存 ([0–1 Create a modern drawing framework | by pubuzhixing | Medium](https://pubuzhixing.medium.com/0-1-create-a-modern-drawing-framework-9b3622466213#:~:text=Node%20content%20is%20embedded%20into,content%20to%20support%20rich%20text))。渲染层还封装了一些基础组件（如 `ReactBoard`/`AngularBoard`）用于将 SVG 画布挂载到页面。

- **交互层（Interaction Layer）**：核心 Board 组件监听用户事件（如 `mousedown`、`mousemove`、`keydown` 等），并将事件分发给插件。默认支持画布缩放、平移等基础交互，插件可重写这些行为来自定义业务操作 ([0–1 Create a modern drawing framework | by pubuzhixing | Medium](https://pubuzhixing.medium.com/0-1-create-a-modern-drawing-framework-9b3622466213#:~:text=1,Overwriable%20Rendering%20%28Controlling%20Rendering)) ([0–1 Create a modern drawing framework | by pubuzhixing | Medium](https://pubuzhixing.medium.com/0-1-create-a-modern-drawing-framework-9b3622466213#:~:text=Step%202%3A%20Process%20the%20circle,drawing%20interaction))。例如，在“绘制圆形”模式下，插件会拦截 `mousedown` 和 `mousemove` 来生成圆形元素（见下方示例代码）。

- **插件系统（Plugin System）**：Plait 核心定义插件机制，各类功能（思维导图、流程图等）通过插件实现 ([0–1 Create a modern drawing framework | by pubuzhixing | Medium](https://pubuzhixing.medium.com/0-1-create-a-modern-drawing-framework-9b3622466213#:~:text=1,Overwriable%20Rendering%20%28Controlling%20Rendering))。在使用时，将插件函数（如 `withMind`、`withDraw`）列表传入白板组件，框架在初始化时依次调用它们注册事件处理和渲染方法 ([GitHub - plait-board/x-plait: A completely customizable framework for building all-in-one drawing whiteboards](https://github.com/plait-board/x-plait#:~:text=%3Cplait,board)) ([0–1 Create a modern drawing framework | by pubuzhixing | Medium](https://pubuzhixing.medium.com/0-1-create-a-modern-drawing-framework-9b3622466213#:~:text=1,Overwriable%20Rendering%20%28Controlling%20Rendering))。插件可以覆写数据渲染和交互行为的钩子（如 `drawElement`、`mousedown`），从而扩展功能 ([0–1 Create a modern drawing framework | by pubuzhixing | Medium](https://pubuzhixing.medium.com/0-1-create-a-modern-drawing-framework-9b3622466213#:~:text=1,Overwriable%20Rendering%20%28Controlling%20Rendering))。

- **协作层（Collaboration）**：Plait 的数据模型支持实时协作编辑，多用户可同时编辑同一白板 ([GitHub - plait-board/x-plait: A completely customizable framework for building all-in-one drawing whiteboards](https://github.com/plait-board/x-plait#:~:text=,currently%20only%20supports%20Angular%20framework))。框架本身使用不可变状态和事件驱动更新，可与协作库（如 Yjs/CRDT）集成，实现变更广播和合并，保证多端数据一致性。核心通过 `PlaitBoardChangeEvent` 将数据变更以事件形式输出，客户端根据事件更新本地状态以同步协作。

下图示意了 Plait 的高层架构分层关系（示例）：



## 数据结构设计

Plait 采用 Slate 风格的树形数据结构来描述白板内容 ([0–1 Create a modern drawing framework | by pubuzhixing | Medium](https://pubuzhixing.medium.com/0-1-create-a-modern-drawing-framework-9b3622466213#:~:text=1,can%20be%20intercepted%20and%20processed))。最顶层是一个“白板（Board）”对象，它包含一个元素列表 `children: PlaitElement[]`，每个 `PlaitElement` 可以是图形、文本或容器节点等。典型的数据模型包括：

- **节点（Node）**：每个节点是一个对象（接口 `PlaitElement`），包含字段 `type`（元素类型，如 `'node'`、`'edge'`、`'group'` 等）、`id`（唯一标识）、以及对应类型的数据字段（例如节点坐标`x,y`、大小、文本内容、子节点列表等）。节点可嵌套形成层级结构，如思维导图中的分支层级。 ([0–1 Create a modern drawing framework | by pubuzhixing | Medium](https://pubuzhixing.medium.com/0-1-create-a-modern-drawing-framework-9b3622466213#:~:text=1,can%20be%20intercepted%20and%20processed))

- **白板（Board）**：对应整个画布状态，其中 `children` 是根节点列表。Board 对象还维护全局属性，如当前缩放比例、平移偏移、选中元素列表等。框架提供 `PlaitBoard` 类来封装这些状态和常用操作 ([GitHub - plait-board/x-plait: A completely customizable framework for building all-in-one drawing whiteboards](https://github.com/plait-board/x-plait#:~:text=Package%20Name%20Description%20%40plait%2Fcore%20Core,Basic%20tool))。

- **连接关系（Connections）**：连接通常作为特殊类型的节点存在，例如流程图中的连线可以表示为 `type: 'edge'` 的元素，对象内可能包含起点和终点引用（如源节点 `sourceId`、目标节点 `targetId`），以及路径坐标或箭头样式等属性。插件在渲染时根据这些数据生成 SVG 路径或线段。

- **数据更新（Transforms）**：Plait 提供一组原子操作函数，用于增删改查节点。所有操作都会生成新的不可变数据状态，并通过 `PlaitBoardChangeEvent` 通知视图更新 ([0–1 Create a modern drawing framework | by pubuzhixing | Medium](https://pubuzhixing.medium.com/0-1-create-a-modern-drawing-framework-9b3622466213#:~:text=1,can%20be%20intercepted%20and%20processed))。这种以数据为中心的方式保证了渲染与交互的统一，也方便与协作同步机制结合。

*示例：* 插件定义的新元素接口，如下为圆形元素的数据结构示例。代码中定义了圆心坐标和半径：  

```ts
export interface CircleElement {
  type: 'circle';
  radius: number;
  dot: [number, number];
}
```

以上数据模型决定了渲染时生成的 SVG 元素（如 `<circle>` 或 RoughJS 绘图命令）需要读取并绘制对应属性。

## 渲染引擎分析

Plait 默认采用 **SVG + RoughJS** 组合进行绘制 ([0–1 Create a modern drawing framework | by pubuzhixing | Medium](https://pubuzhixing.medium.com/0-1-create-a-modern-drawing-framework-9b3622466213#:~:text=Canvas%20or%20SVG,would%20try%20this%20solution%20first)) ([0–1 Create a modern drawing framework | by pubuzhixing | Medium](https://pubuzhixing.medium.com/0-1-create-a-modern-drawing-framework-9b3622466213#:~:text=,party%20drawing%20library%20roughjs))。具体特点如下：

- **SVG 绘制**：使用 SVG 容器渲染节点和连线。选用 SVG 而非 Canvas 的原因是 SVG 对 DOM 友好，方便嵌入 HTML 内容，同时可利用 RoughJS 让线条呈现手绘风格 ([0–1 Create a modern drawing framework | by pubuzhixing | Medium](https://pubuzhixing.medium.com/0-1-create-a-modern-drawing-framework-9b3622466213#:~:text=Canvas%20or%20SVG,would%20try%20this%20solution%20first)) ([0–1 Create a modern drawing framework | by pubuzhixing | Medium](https://pubuzhixing.medium.com/0-1-create-a-modern-drawing-framework-9b3622466213#:~:text=,party%20drawing%20library%20roughjs))。性能方面经测试 SVG 能够平稳地渲染 1000 级别节点而不卡顿 ([0–1 Create a modern drawing framework | by pubuzhixing | Medium](https://pubuzhixing.medium.com/0-1-create-a-modern-drawing-framework-9b3622466213#:~:text=Canvas%20or%20SVG,would%20try%20this%20solution%20first))。

- **Rich Text 和 React DOM**：为了支持富文本，Plait 在 SVG 内使用 `<foreignObject>` 嵌套 HTML 元素。这样可以直接在 SVG 中放入 React 管理的 DOM 节点（例如富文本编辑框） ([0–1 Create a modern drawing framework | by pubuzhixing | Medium](https://pubuzhixing.medium.com/0-1-create-a-modern-drawing-framework-9b3622466213#:~:text=Node%20content%20is%20embedded%20into,content%20to%20support%20rich%20text))。因此元素渲染层可以同时包含原生 SVG 图形（由 RoughJS 或手写路径绘制）和 HTML DOM 组件，满足界面交互和样式扩展需求。

- **渲染流程**：PlaitBoard 负责创建基础 SVG 画布并应用当前视图变换（平移、缩放）。当数据变化或初始化时，框架遍历所有元素数据，对每个元素调用插件提供的 `drawElement` 方法生成对应的 SVG 子元素（可能是 `<g>` 分组或其他组件） ([0–1 Create a modern drawing framework | by pubuzhixing | Medium](https://pubuzhixing.medium.com/0-1-create-a-modern-drawing-framework-9b3622466213#:~:text=,frame%20or%20Can%20be%20connected))。对于更新后的元素，调用 `redrawElement`。当元素被删除时，调用 `destroyElement` 清理 SVG 元素 ([0–1 Create a modern drawing framework | by pubuzhixing | Medium](https://pubuzhixing.medium.com/0-1-create-a-modern-drawing-framework-9b3622466213#:~:text=,frame%20or%20Can%20be%20connected))。

- **React 集成**：对于 React 应用，可使用官方提供的 `@plait/react-board` 组件作为白板容器。该组件内部渲染 SVG 画布并将 PlaitBoard 逻辑挂载到 React 生命周期中。同时，`@plait/react-text` 等组件负责将 Slate 文本节点渲染为 React 可编辑文本。这使得 Plait 白板可以无缝集成到 React 构建的界面中。

*示例：* Plait 中利用 `<foreignObject>` 嵌入 HTML 的方式，允许在 SVG 里显示富文本，例如思维节点的文字部分 ([0–1 Create a modern drawing framework | by pubuzhixing | Medium](https://pubuzhixing.medium.com/0-1-create-a-modern-drawing-framework-9b3622466213#:~:text=Node%20content%20is%20embedded%20into,content%20to%20support%20rich%20text))：

```tsx
<svg>
  <!-- 其他图形元素 -->
  <foreignObject x={x} y={y} width={w} height={h}>
    <div xmlns="http://www.w3.org/1999/xhtml">
      <RichTextComponent text={node.text} />
    </div>
  </foreignObject>
</svg>
```

## 交互框架梳理

Plait 的交互系统由 Board 监听用户输入事件，然后通过插件机制分发和处理。以下是常用交互的实现流程：

- **元素拖拽**：当用户在画布上选中一个元素并按下鼠标时，Board 捕获 `mousedown` 事件。插件可以判断点击目标并设置拖拽状态（例如记录起始位置）。随后在 `mousemove` 事件中，插件计算指针偏移并更新对应元素的数据坐标，实时移动元素。最终在 `mouseup` 时结束拖拽，触发数据变更事件。整个过程中，Plait 保证每次修改都是通过变换函数完成，以便触发重绘。

- **画布平移**：当用户在空白区域按住鼠标并拖动时（或按住滚轮/右键拖动），Board 切换到平移模式，调整 SVG 视图的平移偏移量。实现上通常修改顶层容器的 `transform` 或 `viewBox`，让整个画布跟随鼠标移动。

- **缩放**：Board 监听 `wheel` 滚轮事件，并结合 Ctrl 键等判断是否为缩放操作。根据滚轮方向增减缩放比例，并居中或围绕鼠标位置缩放 SVG 视图。缩放操作直接更新视图变换矩阵，不更改元素数据本身。

- **旋转**：如果元素支持旋转（如某些图形需要自由旋转），通常在选中元素时显示旋转手柄。用户拖动该手柄时，插件监听 `mousemove` 事件计算旋转角度，更新元素数据的旋转属性，从而使元素重绘时旋转。

- **框选（多选）**：当用户在空白处按下鼠标并拖出一个矩形区域时，插件会在画布上临时绘制一个半透明的选框。移动过程中实时调整选框范围；松开鼠标后，插件遍历所有元素，判断元素与选框是否相交，将满足条件的元素加入当前选中集并触发选中变更事件。

- **快捷键**：Board 在全局层监听键盘事件(`keydown`/`keyup`)，插件或应用程序可捕获常用快捷键（如 Ctrl+Z 撤销、Delete 删除、Ctrl+C/Ctrl+V 复制粘贴、Ctrl+A 全选等），并调用相应的数据变换操作。Plait 本身未定义所有快捷键，而是提供机制让上层应用或插件注册自定义快捷键处理。

- **交互钩子**：插件可以重写或扩展 Board 的事件处理函数。例如，将 `board.mousedown` 设置为自定义函数，从而在特定模式下截获点击事件 ([0–1 Create a modern drawing framework | by pubuzhixing | Medium](https://pubuzhixing.medium.com/0-1-create-a-modern-drawing-framework-9b3622466213#:~:text=,custom%20rendering%3A%20drawElement%2C%20redrawElement%2C%20destroyElement)) ([0–1 Create a modern drawing framework | by pubuzhixing | Medium](https://pubuzhixing.medium.com/0-1-create-a-modern-drawing-framework-9b3622466213#:~:text=Step%202%3A%20Process%20the%20circle,drawing%20interaction))。下例展示了一个“圆形绘制”模式的处理：当 `board.cursor==='circle'` 时，`mousedown` 事件开始记录圆心；否则调用原始的 `mousedown` 逻辑 ([0–1 Create a modern drawing framework | by pubuzhixing | Medium](https://pubuzhixing.medium.com/0-1-create-a-modern-drawing-framework-9b3622466213#:~:text=,frame%20or%20Can%20be%20connected)) ([0–1 Create a modern drawing framework | by pubuzhixing | Medium](https://pubuzhixing.medium.com/0-1-create-a-modern-drawing-framework-9b3622466213#:~:text=Step%202%3A%20Process%20the%20circle,drawing%20interaction))。  

```ts
board.mousedown = (event: MouseEvent) => {
  if (board.cursor === 'circle') {
    // 记录圆心坐标
    start = toPoint(event.x, event.y, board.host);
    return;
  }
  // 调用默认处理
  mousedown(event);
};
```  
*(以上代码来自插件示例 ([0–1 Create a modern drawing framework | by pubuzhixing | Medium](https://pubuzhixing.medium.com/0-1-create-a-modern-drawing-framework-9b3622466213#:~:text=Step%202%3A%20Process%20the%20circle,drawing%20interaction))，用于说明交互事件的覆盖方式。)*

## 插件系统设计

Plait 插件系统设计核心参考了 Slate 编辑器的思路 ([0–1 Create a modern drawing framework | by pubuzhixing | Medium](https://pubuzhixing.medium.com/0-1-create-a-modern-drawing-framework-9b3622466213#:~:text=1,Overwriable%20Rendering%20%28Controlling%20Rendering))。其主要特性如下：

- **插件注册**：使用时，在白板组件（如 `<PlaitBoard>` 或 `ReactBoard`）上通过属性传入插件列表。例如 Angular 版中：`<plait-board [plaitPlugins]="[withMind]" ...>` ([GitHub - plait-board/x-plait: A completely customizable framework for building all-in-one drawing whiteboards](https://github.com/plait-board/x-plait#:~:text=%3Cplait,board))。在 React 中同样通过 props 传入 `plugins={[withMind]}`。框架在初始化时依次执行这些插件函数（每个插件一般以 `withX` 命名），将插件逻辑注入 Board 中 ([GitHub - plait-board/x-plait: A completely customizable framework for building all-in-one drawing whiteboards](https://github.com/plait-board/x-plait#:~:text=%3Cplait,board)) ([0–1 Create a modern drawing framework | by pubuzhixing | Medium](https://pubuzhixing.medium.com/0-1-create-a-modern-drawing-framework-9b3622466213#:~:text=1,Overwriable%20Rendering%20%28Controlling%20Rendering))。

- **扩展点**：每个插件可提供以下扩展点：  
  1. **数据扩展**：通过提供自定义元素类型（如思维节点、连线节点等）的接口定义，让 Board 能识别新元素类型。  
  2. **行为钩子**：重写或监听交互事件（`mousedown`、`mousemove`、`keydown` 等），实现元素创建、拖拽、编辑等行为 ([0–1 Create a modern drawing framework | by pubuzhixing | Medium](https://pubuzhixing.medium.com/0-1-create-a-modern-drawing-framework-9b3622466213#:~:text=,frame%20or%20Can%20be%20connected))。  
  3. **渲染钩子**：提供 `drawElement`、`redrawElement`、`destroyElement` 等函数，用于控制元素的绘制和更新 ([0–1 Create a modern drawing framework | by pubuzhixing | Medium](https://pubuzhixing.medium.com/0-1-create-a-modern-drawing-framework-9b3622466213#:~:text=,frame%20or%20Can%20be%20connected))。例如，思维导图插件会为每个节点生成对应的 SVG `<g>` 组和文本，流程图插件会绘制矩形、箭头等。

- **生命周期钩子**：当 Board 创建完成后会触发初始化事件（如 `plaitBoardInitialized`），插件或外部可以在此时获取 `PlaitBoard` 实例，进行进一步配置 ([GitHub - plait-board/x-plait: A completely customizable framework for building all-in-one drawing whiteboards](https://github.com/plait-board/x-plait#:~:text=change%28event%3A%20PlaitBoardChangeEvent%29%20,))。在数据变更时，Board 会触发 `PlaitBoardChangeEvent`（如 Angular 中的 `(plaitChange)` 事件），插件可监听此事件执行额外逻辑 ([GitHub - plait-board/x-plait: A completely customizable framework for building all-in-one drawing whiteboards](https://github.com/plait-board/x-plait#:~:text=board%21%3A%20PlaitBoard%3B))。

- **模块解耦**：Plait 核心仅提供框架层支持，业务功能完全由插件实现。例如思维导图插件只专注于树形结构逻辑和布局（并不包含工具栏按钮等 UI），而上层应用再使用组件化方式为其添加工具栏等组件。这样插件层与 UI 层解耦，提高了可复用性 ([0–1 Create a modern drawing framework | by pubuzhixing | Medium](https://pubuzhixing.medium.com/0-1-create-a-modern-drawing-framework-9b3622466213#:~:text=The%20underlying%20mind%20plugin%20does,core%20interaction%2C%20rendering%2C%20and%20layout))。

总体来说，插件通过组合模式接入 Plait 核心框架，插件函数返回值或在 Board 上注册的钩子函数会参与到事件循环和渲染循环中，实现功能拓展 ([0–1 Create a modern drawing framework | by pubuzhixing | Medium](https://pubuzhixing.medium.com/0-1-create-a-modern-drawing-framework-9b3622466213#:~:text=1,Overwriable%20Rendering%20%28Controlling%20Rendering)) ([0–1 Create a modern drawing framework | by pubuzhixing | Medium](https://pubuzhixing.medium.com/0-1-create-a-modern-drawing-framework-9b3622466213#:~:text=,frame%20or%20Can%20be%20connected))。

## 协作机制分析

Plait 原生支持多人实时协作。其数据模型基于不可变状态，每次操作都会产生新的数据快照，并通过事件机制同步到其他客户端 ([GitHub - plait-board/x-plait: A completely customizable framework for building all-in-one drawing whiteboards](https://github.com/plait-board/x-plait#:~:text=,currently%20only%20supports%20Angular%20framework))。具体保证一致性的方式通常包括：

- **变更广播**：任一用户在本端进行增删改操作时，会触发 `PlaitBoardChangeEvent`，该事件包含最新的整个元素树或操作记录。应用层可以监听此事件，将变化发送至服务器或其他协作者的客户端。

- **冲突解决**：因为 Plait 数据模型使用树形结构并支持原子操作（Transforms），可与 CRDT/OT 等协作库（如 Yjs、ShareDB）结合，将每一步操作序列化并在所有客户端重演。CRDT 本身能自动合并并发修改，保证最终一致。官方文档提到 Plait 数据模型“支持协作功能，多个用户可以同时编辑同一个白板，数据模型确保了数据的一致性和同步” ([GitHub - plait-board/x-plait: A completely customizable framework for building all-in-one drawing whiteboards](https://github.com/plait-board/x-plait#:~:text=,currently%20only%20supports%20Angular%20framework))。

- **一致性保障**：一般通过操作转换（OT）或状态合并（CRDT）技术，使得无论修改顺序如何，最终各端白板内容一致。Plait 的架构不强绑定特定网络协议，允许用户自行选择 WebSocket、WebRTC 等传输方案，并在接收变更时调用 Plait 的数据更新接口应用变更。

总之，Plait 本身提供了协作所需的基础：可序列化的数据模型、事件驱动的更新机制和不可变状态支持；具体的网络同步和冲突解决，则需在应用层或借助第三方库完成。

## 核心模块类/接口/函数梳理

下面列举各模块中关键的类、接口及函数，并说明其作用和关联关系：

- **核心库（@plait/core）**  
  - `PlaitBoard`：白板实例类，包含当前状态（元素树、缩放、偏移、选中集等），以及对数据的读写和交互处理方法。 ([GitHub - plait-board/x-plait: A completely customizable framework for building all-in-one drawing whiteboards](https://github.com/plait-board/x-plait#:~:text=Package%20Name%20Description%20%40plait%2Fcore%20Core,Basic%20tool))  
  - `PlaitElement`（接口）：所有节点数据的顶级接口，定义了基本属性如 `type`、`children` 等，用于描述图形、文本、组等各种元素的数据结构。 ([0–1 Create a modern drawing framework | by pubuzhixing | Medium](https://pubuzhixing.medium.com/0-1-create-a-modern-drawing-framework-9b3622466213#:~:text=1,can%20be%20intercepted%20and%20processed))  
  - `PlaitBoardChangeEvent`：数据变更事件对象，当 Board 数据发生更新时触发，事件中包含更新后的根元素列表，可用来同步外部状态或持久化。  
  - **变换函数**（Transforms）：一组函数（类似 Slate 的 `Transforms` API），用于在数据树上执行增删改操作，如添加节点、删除节点、移动节点等。所有操作都会生成新的不可变数据状态，并通过 `PlaitBoardChangeEvent` 通知视图更新 ([0–1 Create a modern drawing framework | by pubuzhixing | Medium](https://pubuzhixing.medium.com/0-1-create-a-modern-drawing-framework-9b3622466213#:~:text=1,can%20be%20intercepted%20and%20processed))。  
  - `BasePlugin`/`PluginRegistry`：插件管理相关类型，内部维护已注册插件列表，并在事件触发时依次调用插件提供的钩子方法。

- **共用库（@plait/common）**  
  - **绘制辅助**：包括绘图工具类、数学计算函数（点、路径计算）、SVG 封装逻辑等。  
  - 基础交互工具：如对齐、分布等通用算法和基础插件实现，可被多种图板类型重用。

- **文本支持（@plait/text）**  
  - 提供基于 Slate 的富文本能力，定义文本节点类型和对应编辑器插件。包含 `ReactText`（或 `AngularText`）组件，用于渲染和编辑白板中的文本内容。  

- **思维导图插件（@plait/mind）**  
  - `withMind`：插件入口函数，将思维导图功能注册到白板。  
  - `MindNode`、`MindLine` 等接口/类：用于定义思维导图节点和连线的数据结构，以及渲染时创建对应 SVG 元素。  
  - 自动布局算法：独立的布局类（如 `TreeLayout` 等），实现逻辑布局、标准布局、缩进布局等，为节点计算位置 ([GitHub - plait-board/x-plait: A completely customizable framework for building all-in-one drawing whiteboards](https://github.com/plait-board/x-plait#:~:text=%40plait%2Fmind%20Mind%20plugin%20implementation%2C%20based,layout%2C%20standard%20layout%2C%20indented%20layout))。  

- **流程图插件（@plait/draw）**  
  - `withDraw`：流程图插件入口，支持绘制矩形、圆形、箭头、贝塞尔曲线等基础图形。  
  - `FlowElement`、`FlowEdge` 等：定义流程节点和连接线的数据结构。插件提供交互逻辑，允许用户绘制和编辑各种标准流程图符号 ([GitHub - plait-board/x-plait: A completely customizable framework for building all-in-one drawing whiteboards](https://github.com/plait-board/x-plait#:~:text=%40plait%2Fmind%20Mind%20plugin%20implementation%2C%20based,layout%2C%20standard%20layout%2C%20indented%20layout))。

- **流程配置插件（@plait/flow）**  
  - `withFlow`：用于可视化业务流程状态图的插件入口。内部定义了与业务流程相关的节点类型和交互规则 ([GitHub - plait-board/x-plait: A completely customizable framework for building all-in-one drawing whiteboards](https://github.com/plait-board/x-plait#:~:text=%40plait%2Fmind%20Mind%20plugin%20implementation%2C%20based,layout%2C%20standard%20layout%2C%20indented%20layout))。

- **布局算法库（@plait/layouts）**  
  - 包含思维导图所需的辅助布局算法类（如 `TreeLayout`、`IndentedLayout` 等），供 `@plait/mind` 插件使用，实现节点自动分布 ([GitHub - plait-board/x-plait: A completely customizable framework for building all-in-one drawing whiteboards](https://github.com/plait-board/x-plait#:~:text=%40plait%2Fmind%20Mind%20plugin%20implementation%2C%20based,layout%2C%20standard%20layout%2C%20indented%20layout))。

- **React 集成（@plait/react-board、@plait/react-text）**  
  - `ReactBoard`：React 组件，封装了 PlaitBoard 对象和 SVG 画布，将 Plait 集成到 React 应用。它接受插件列表和初始值等属性，并在内部创建 `PlaitBoard` 实例。  
  - `ReactText`：用于渲染文本元素的 React 组件，依赖 Slate，在 SVG 内部插入可编辑文本。

以上类/接口相互配合：核心库负责数据管理和事件分发，共用库提供绘制工具，插件库定义具体的节点类型和交互逻辑，React/Angular 组件则负责在对应框架中承载白板视图。通过组合这些模块，开发者可以快速构建丰富的白板功能并在此基础上二次开发扩展 ([GitHub - plait-board/x-plait: A completely customizable framework for building all-in-one drawing whiteboards](https://github.com/plait-board/x-plait#:~:text=Package%20Name%20Description%20%40plait%2Fcore%20Core,layout%2C%20standard%20layout%2C%20indented%20layout)) ([0–1 Create a modern drawing framework | by pubuzhixing | Medium](https://pubuzhixing.medium.com/0-1-create-a-modern-drawing-framework-9b3622466213#:~:text=1,Overwriable%20Rendering%20%28Controlling%20Rendering))。

**参考资料：** Plait 官方文档及示例 ([GitHub - plait-board/x-plait: A completely customizable framework for building all-in-one drawing whiteboards](https://github.com/plait-board/x-plait#:~:text=,Basic%20drawing%20tool%20functions)) ([0–1 Create a modern drawing framework | by pubuzhixing | Medium](https://pubuzhixing.medium.com/0-1-create-a-modern-drawing-framework-9b3622466213#:~:text=1,Overwriable%20Rendering%20%28Controlling%20Rendering)) ([0–1 Create a modern drawing framework | by pubuzhixing | Medium](https://pubuzhixing.medium.com/0-1-create-a-modern-drawing-framework-9b3622466213#:~:text=1,can%20be%20intercepted%20and%20processed)) ([0–1 Create a modern drawing framework | by pubuzhixing | Medium](https://pubuzhixing.medium.com/0-1-create-a-modern-drawing-framework-9b3622466213#:~:text=Node%20content%20is%20embedded%20into,content%20to%20support%20rich%20text)) ([GitHub - plait-board/x-plait: A completely customizable framework for building all-in-one drawing whiteboards](https://github.com/plait-board/x-plait#:~:text=%3Cplait,board))（资料中有更详细的插件和 API 说明）。