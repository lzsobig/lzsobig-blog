export type ArticleTag =
  | "ai-app"
  | "smart-build"
  | "energy"
  | "frontier"
  | "tools";

export interface Article {
  id: number;
  tag: ArticleTag;
  tagLabel: string;
  title: string;
  desc: string;
  img: string;
  color: string;
  date: string;
  featured: boolean;
  body: string;
}

export const TAG_LABELS: Record<ArticleTag, string> = {
  "ai-app": "AI 应用",
  "smart-build": "智能建造",
  energy: "能源工程",
  frontier: "前沿技术",
  tools: "工具推荐",
};

export const TAG_ICONS: Record<ArticleTag, string> = {
  "ai-app": "🤖",
  "smart-build": "🏗️",
  energy: "⚡",
  frontier: "🚀",
  tools: "🧰",
};

export const articles: Article[] = [
  {
    id: 1,
    tag: "smart-build",
    tagLabel: "智能建造",
    title: "计算机视觉在施工质量检测中的实践",
    desc: "从裂缝识别到平整度测量，用深度学习替代人工巡检的完整落地路径。",
    img: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1200&auto=format&fit=crop",
    color: "#6366f1",
    date: "2026-06-12",
    featured: true,
    body: `
<p>在基建狂飙的时代，施工质量检测长期依赖"人眼 + 卡尺"。但人工巡检存在盲区大、主观性强、记录难追溯的痛点。过去三年，我们用计算机视觉重构了这套流程，把检测从"抽样"变成"全量"。</p>
<h2 id="sec-1">一、为什么是计算机视觉</h2>
<p>传统的无损检测（超声、雷达）精度高但效率低，无法覆盖大体量构件。而手机拍一张照片就能完成的 CV 检测，天然适合施工现场的高通量场景。关键不在于模型多先进，而在于"能否在现场稳定运行"。</p>
<blockquote>工程的数字化，不是把纸变成屏幕，而是把"看不见"变成"可计算"。</blockquote>
<h2 id="sec-2">二、裂缝识别：从分割到量化</h2>
<p>裂缝检测的核心是语义分割。我们用 DeepLabV3+ 作为基线，配合 ResNet-50 backbone，在自建的 8000 张标注数据集上训练。但仅分割出裂缝像素还不够——还需要把像素面积换算成物理尺寸：</p>
<pre><code>def crack_width(pixel_mask, pixel_per_mm):
    # 沿裂缝骨架采样法线方向宽度
    skeleton = medial_axis(pixel_mask)
    widths = []
    for pt in skeleton_points:
        normal = compute_normal(skeleton, pt)
        width_px = measure_along(pixel_mask, pt, normal)
        widths.append(width_px / pixel_per_mm)
    return max(widths), np.mean(widths)</code></pre>
<p>其中 <code>pixel_per_mm</code> 通过现场放置的标定板获得。这套流程在桥梁墩柱检测中将最大裂缝宽度的误差控制在 0.05mm 以内，优于规范要求的 0.1mm。</p>
<h2 id="sec-3">三、平整度测量：从单目到结构光</h2>
<p>混凝土表面平整度的传统方法是 2m 靠尺 + 塞尺。我们尝试了两种 CV 方案：单目深度估计（MiDaS）和结构光主动投影。前者部署简单但精度有限，后者需要在机械臂上安装投影模组，但能实现 0.5mm 级精度。</p>
<p>最终我们选择了折中方案：用手机 LiDAR（iPhone Pro 系列）做粗扫，再对关键区域用结构光精扫。这样既保留了便携性，又保证了关键测点的精度。</p>
<h2 id="sec-4">四、落地的三个坑</h2>
<p>第一，施工现场光照变化剧烈，从晨光到正午到夜间施工灯，色温和亮度跨度极大。解决方法是数据增强 + 现场标定白平衡。第二，灰尘和水渍会被误判为缺陷，需要引入时序一致性校验（同一位置连续多帧才报缺陷）。第三，工人的反馈闭环——检测系统报了缺陷，但工人不修，等于白检。我们把检测结果直接接入项目管理的工单系统，未闭环的缺陷会自动升级预警。</p>
<h2 id="sec-5">结语</h2>
<p>计算机视觉在施工质量检测中的价值，不在于替代质检员，而在于把质检从"经验驱动"变成"数据驱动"。当一个项目所有的检测记录都可追溯、可统计、可对比时，工程质量的提升就有了量化依据。</p>
`,
  },
  {
    id: 2,
    tag: "smart-build",
    tagLabel: "智能建造",
    title: "BIM + AI：从自动建模到智能审图",
    desc: "BIM 不只是三维模型，当它遇上 AI，正在重塑设计、审图与施工协同的全链路。",
    img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1200&auto=format&fit=crop",
    color: "#8b5cf6",
    date: "2026-06-05",
    featured: true,
    body: `
<p>BIM（建筑信息模型）被讨论了十几年，真正大规模落地却卡在两个环节：建模成本高、审图靠人工。AI 正在从两端撬动这两个瓶颈。</p>
<h2 id="sec-1">一、自动建模：从二维图纸到三维 BIM</h2>
<p>国内大量存量项目仍是 CAD 二维图纸。手工翻模一个中型项目需要 2-4 周。我们用图神经网络（GNN）做了图纸语义解析，把线条、文字、符号映射成构件实体，再自动生成 IFC 格式的 BIM 模型。</p>
<blockquote>BIM 的成本不在软件，在数据。而 AI 的价值，在于把数据生产的边际成本降到接近零。</blockquote>
<p>关键技术点有三个：图纸矢量化后的图元聚类、构件类型的规则 + 学习混合分类、空间拓扑关系的约束求解。目前我们在住宅类项目的自动建模准确率达到 92%，剩下 8% 由人工校核。</p>
<h2 id="sec-2">二、智能审图：规范知识的工程化</h2>
<p>审图是 BIM 应用中价值最直接的场景。一个项目的图纸要符合几十本规范，人工审图平均漏检率 15%。我们把审图拆成两类任务：</p>
<p><strong>几何类审查</strong>——净高、防火间距、疏散距离，这类可以用 BIM 模型的几何信息直接计算，规则明确、可程序化。我们用 IfcOpenDDL 做几何查询，把规范条文编码成可执行的规则集。</p>
<p><strong>语义类审查</strong>——比如"楼梯间不应敷设可燃气体管道"，需要理解构件的语义和空间关系。这类用 RAG（检索增强生成）+ 规范知识库，让大模型在理解规范条文的基础上对 BIM 构件做合规判断。</p>
<h2 id="sec-3">三、施工协同：4D 模拟与冲突检测</h2>
<p>BIM 的 4D（加时间维度）模拟，过去因为算力限制只能做关键节点。现在结合 AI 的施工进度预测，可以做全周期的 4D 推演。我们把施工计划、BIM 模型、现场进度照片三者做对齐，AI 自动识别实际进度与计划的偏差，并预警潜在的工序冲突。</p>
<pre><code># 简化的冲突检测逻辑
def detect_clashes(model_a, model_b, tolerance=0.01):
    clashes = []
    for elem_a in model_a.solids:
        for elem_b in model_b.solids:
            if elem_a.bbox.intersects(elem_b.bbox):
                if elem_a.intersects(elem_b, tolerance):
                    clashes.append((elem_a.id, elem_b.id))
    return clashes</code></pre>
<h2 id="sec-4">结语</h2>
<p>BIM + AI 的终局不是"更好的画图工具"，而是工程的数字孪生底座。当设计、施工、运维的全生命周期数据都沉淀在 BIM 模型里，并可以被 AI 实时查询和推理时，建筑才真正成为"会思考的基础设施"。</p>
`,
  },
  {
    id: 3,
    tag: "energy",
    tagLabel: "能源工程",
    title: "用 LSTM 预测建筑能耗：一个完整案例",
    desc: "从数据采集到模型部署，用序列模型做建筑能耗预测的全流程实战。",
    img: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=1200&auto=format&fit=crop",
    color: "#10b981",
    date: "2026-05-28",
    featured: true,
    body: `
<p>建筑能耗占全社会终端能耗的 20% 以上，精准的能耗预测是需求侧响应和节能优化的前提。这篇用一个完整的商业综合体项目，讲清楚 LSTM 在能耗预测中的全流程。</p>
<h2 id="sec-1">一、问题定义</h2>
<p>预测对象是某商业综合体未来 24 小时的逐时能耗（kWh）。输入数据包括：历史能耗（过去 7 天逐时）、气象数据（温度、湿度、辐照）、日历特征（星期、节假日、时段）、人流数据。这是一个典型的多变量时间序列预测问题。</p>
<blockquote>能耗预测的难点不在于模型，而在于数据。脏数据会让再强的模型都变成"精致的废物"。</blockquote>
<h2 id="sec-2">二、数据工程</h2>
<p>真实项目的 70% 时间花在数据清洗上。我们遇到的问题包括：电表跳变（换表导致）、缺失值（通讯中断）、异常尖峰（设备启停）、时区错乱。清洗流程：</p>
<pre><code>def clean_energy_series(df):
    # 1. 跳变检测：相邻点差值超过 3 倍标准差
    df = detect_and_fix_jumps(df, threshold=3)
    # 2. 缺失值插补：工作时间用前值，非工作时间用同时段均值
    df = impute_missing(df, strategy='contextual')
    # 3. 异常尖峰：用 IsolationForest 识别并平滑
    df = remove_spikes(df, contamination=0.01)
    # 4. 时区对齐到 Asia/Shanghai
    df = df.tz_localize('UTC').tz_convert('Asia/Shanghai')
    return df</code></pre>
<h2 id="sec-3">三、模型设计</h2>
<p>为什么选 LSTM 而不是 Transformer？在建筑能耗这种周期性强、序列长度适中（168 小时窗口）的场景，LSTM 的表现与 Transformer 接近，但部署更轻量。模型结构：双层 LSTM（hidden=128）+ 全连接输出层。损失函数用 Huber Loss，对异常值更鲁棒。</p>
<p>特征工程的关键是周期特征的编码。星期用 one-hot，小时用 sin/cos 编码保留周期性，节假日用二值。气象数据用未来 24 小时的预报值（从气象 API 获取）。</p>
<h2 id="sec-4">四、训练与评估</h2>
<p>数据集 2 年逐时数据，前 18 个月训练，后 6 个月测试。评估指标用 MAPE（平均绝对百分比误差）和 CV-RMSE。最终模型在测试集上 MAPE 8.3%，CV-RMSE 11.2%，满足工程应用要求（一般要求 MAPE 小于 10%）。</p>
<p>需要注意的是，工作日和节假日的预测误差差异很大。工作日 MAPE 6%，节假日能到 15%。解决办法是对节假日单独训练一个轻量模型。</p>
<h2 id="sec-5">五、部署与迭代</h2>
<p>模型部署在边缘服务器上，每天凌晨拉取最新数据并预测当天 24 小时能耗，结果推送到楼宇自控系统做冷机群控优化。模型每月用新数据增量训练一次，每季度全量重训练。</p>
<h2 id="sec-6">结语</h2>
<p>LSTM 不是能耗预测的终点，但它是一个足够稳健的起点。当你把数据工程、特征工程、模型迭代这套闭环跑通后，再换更强的模型只是替换一个组件的事。</p>
`,
  },
  {
    id: 4,
    tag: "frontier",
    tagLabel: "前沿技术",
    title: "建筑数字孪生的技术栈与落地路径",
    desc: "数字孪生不是噱头，拆解从感知层到智能层的技术选型与工程实现。",
    img: "https://images.unsplash.com/photo-1486325212027-8081e485255e?q=80&w=1200&auto=format&fit=crop",
    color: "#0ea5e9",
    date: "2026-05-20",
    featured: true,
    body: `
<p>"数字孪生"被滥用成营销词汇后，真正的技术内核反而模糊了。这篇文章试图还原它作为一套技术栈的真实样貌。</p>
<h2 id="sec-1">一、数字孪生的四层架构</h2>
<p>一个完整的建筑数字孪生系统可以分为四层：感知层（传感器）、传输层（IoT 网络）、数据层（时序 + 关系 + 几何）、智能层（分析与决策）。每一层都有成熟和不成熟的技术选型。</p>
<blockquote>数字孪生的本质，是用数据的镜像替代物理的试错。它不是为了好看，而是为了让建筑可以被"计算"。</blockquote>
<h2 id="sec-2">二、感知层：选什么传感器</h2>
<p>常见误区是"传感器越多越好"。实际上，传感器数量的边际收益递减很快。我们建议从业务问题倒推传感器配置：要做能耗优化，电表 + 温湿度足够；要做结构健康监测，应变计 + 倾角计 + 加速度计三件套；要做空间管理，人流计数 + 门禁即可。</p>
<p>选型时要考虑三个维度：精度、稳定性、通讯协议。LoRa 适合低频远距离，NB-IoT 适合运营商网络覆盖区域，Wi-Fi/Zigbee 适合室内高密度。我们的经验是，混合组网比单一协议更经济。</p>
<h2 id="sec-3">三、数据层：时序 + 图 + 几何</h2>
<p>这是技术栈最复杂的部分。传感器数据是时序的，构件关系是图结构的，建筑空间是几何的。单一数据库无法高效处理三类数据。</p>
<pre><code># 典型的混合存储架构
timeseries_db = InfluxDB()      # 传感器时序数据
graph_db      = Neo4j()          # 构件拓扑关系
geometry_db   = PostgreSQL+PostGIS # 空间几何
cache         = Redis()          # 实时热点数据

def query_twin(element_id, time_range):
    geometry = geometry_db.query(f"SELECT geom FROM elements WHERE id={element_id}")
    relations = graph_db.run(f"MATCH (n)-[r]-(m) WHERE n.id={element_id} RETURN r,m")
    series = timeseries_db.query(f"SELECT * FROM sensor_{element_id} WHERE time > {time_range.start}")
    return merge(geometry, relations, series)</code></pre>
<h2 id="sec-4">四、智能层：从监测到预测到决策</h2>
<p>大多数数字孪生项目止步于"监测"——把数据可视化到大屏上。但真正的价值在预测和决策。能耗预测（上篇讲过）、设备故障预测（基于振动和温度的异常检测）、运维决策推荐（基于知识图谱的故障根因分析），是智能层的三个典型应用。</p>
<h2 id="sec-5">五、落地的三个现实约束</h2>
<p>第一，业主的付费意愿。数字孪生的 ROI 周期长，需要找到"短期可见收益"的切入点（如能耗优化 3 个月回本）。第二，数据归属权。传感器数据归业主还是运维方，这个法律问题不解决，数据共享就是空谈。第三，系统的可维护性。很多项目交付后无人运维，半年就成"数字僵尸"。我们的做法是把运维能力产品化，培训业主团队。</p>
<h2 id="sec-6">结语</h2>
<p>建筑数字孪生不是一锤子买卖，它是一个持续运营的数字资产。技术栈选型要为"十年运维"设计，而不只为"上线演示"。</p>
`,
  },
  {
    id: 5,
    tag: "energy",
    tagLabel: "能源工程",
    title: "强化学习优化暖通空调系统控制",
    desc: "让 AI 自己学会怎么开冷机，比传统 PID 控制节能 18% 的实战记录。",
    img: "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?q=80&w=1200&auto=format&fit=crop",
    color: "#f59e0b",
    date: "2026-05-12",
    featured: true,
    body: `
<p>暖通空调（HVAC）占建筑能耗的 40-60%。传统控制策略基于规则和 PID，难以应对动态负荷变化。强化学习（RL）让控制器在"试错"中学习最优策略，是建筑节能的潜力方向。但 RL 落地有三个难题：样本效率、安全性、可解释性。</p>
<h2 id="sec-1">一、问题建模</h2>
<p>把 HVAC 控制建模为马尔可夫决策过程（MDP）：状态是各区域温度、湿度、室外气象、电价；动作是冷机出水温度设定、水泵频率、风阀开度；奖励是负的能耗成本加舒适度惩罚。</p>
<blockquote>RL 在仿真里无所不能，在真实系统里寸步难行。中间隔着的，是"安全"两个字。</blockquote>
<h2 id="sec-2">二、仿真先行：EnergyPlus + RLlib</h2>
<p>真实系统不允许 RL 直接试错（万一把冷机开爆了）。所以我们先用 EnergyPlus 建仿真环境，在仿真里训练 RL 智能体。用 Ray RLlib 的 PPO 算法，训练 200 万步后策略收敛。</p>
<pre><code>import gymnasium as gym
from ray.rllib.algorithms.ppo import PPO

class HVACEnv(gym.Env):
    def __init__(self, energyplus_model):
        self.model = energyplus_model
        self.action_space = gym.spaces.Box(
            low=[5, 20, 0],   # 出水温度下限、风频下限、风阀下限
            high=[15, 50, 1], # 对应上限
        )
        self.observation_space = gym.spaces.Box(...)

    def step(self, action):
        self.model.set_controls(action)
        self.model.step(3600)  # 推进1小时
        obs = self.model.get_state()
        energy = self.model.get_energy()
        comfort_penalty = self.model.get_comfort_violation()
        reward = -energy * price - 100 * comfort_penalty
        return obs, reward, False, {}</code></pre>
<h2 id="sec-3">三、Sim2Real 的鸿沟</h2>
<p>仿真训出来的策略直接搬到真实系统，性能会大幅下降（仿真-现实差距）。我们的解决方法：一是域随机化（domain randomization），在仿真里随机扰动气象、负荷、设备参数，让策略对不确定性鲁棒；二是影子模式运行，先让 RL 策略只输出建议不执行，与实际控制对比 2 周，确认安全后再切为 advisory 模式（人工确认后执行），最后才全自动。</p>
<h2 id="sec-4">四、安全约束的工程化</h2>
<p>RL 最大的风险是"探索性动作"破坏设备。我们做了两层安全网：硬约束（动作空间预先裁剪到设备允许范围）+ 软约束（舒适度违反超过阈值时强制切回 PID）。这套安全机制让 RL 在 6 个月试运行中零事故。</p>
<h2 id="sec-5">五、效果与反思</h2>
<p>在 5 万平米的办公楼实测，RL 策略比原有 PID 控制节能 18%，舒适度（PMV 指标）持平。但 RL 模型的可解释性是短板——当运维人员问"为什么今天出水温度设到 9 度"，我们只能用 SHAP 值给一个事后解释，不如规则控制直观。这是 RL 大规模推广的真正障碍。</p>
<h2 id="sec-6">结语</h2>
<p>强化学习优化 HVAC 是有真实价值的方向，但它不会一夜取代传统控制。混合策略（规则兜底 + RL 优化）是当下最务实的路径。技术的成熟，往往不是"更强"，而是"更稳"。</p>
`,
  },
  {
    id: 6,
    tag: "smart-build",
    tagLabel: "智能建造",
    title: "无人机 + AI：基建巡检的自动化革命",
    desc: "桥梁、电网、管线，无人机正在重塑基建巡检的效率与安全边界。",
    img: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?q=80&w=1200&auto=format&fit=crop",
    color: "#f97316",
    date: "2026-05-04",
    featured: true,
    body: `
<p>基建巡检长期是高危、低效、高成本的三难场景。工人攀爬高压铁塔、桥梁挂篮作业，每年都有伤亡。无人机 + AI 的组合，正在把"人去危险的地方"变成"机器去，人来判断"。</p>
<h2 id="sec-1">一、巡检的三种无人机形态</h2>
<p>不是所有巡检都适合同一种无人机。桥梁近距离巡检用多旋翼（悬停精度高），长距离管线用固定翼（续航长），复杂空间（如变电站内部）用系留无人机（持续供电）。选错机型会让项目从一开始就走弯路。</p>
<blockquote>无人机的价值不在于"飞"，而在于"看得清、算得快、传得稳"。</blockquote>
<h2 id="sec-2">二、航迹规划：从手动到自动</h2>
<p>早期无人机巡检靠飞手手动操作，效率低且不可复现。现在的主流是"三维建模 + 自动航迹"。先用倾斜摄影对桥梁建三维模型，然后在模型上标注检测点位，自动生成航迹。这样每次巡检的飞行路径完全一致，缺陷的时序对比才有意义。</p>
<pre><code>def generate_inspection_path(bim_model, inspection_points):
    path = []
    for point in inspection_points:
        # 找到距离检测点 3-5 米、且无遮挡的悬停位置
        hover_pos = find_safe_hover(bim_model, point, dist=[3,5])
        # 计算相机朝向（对准检测点）
        camera_pose = look_at(hover_pos, point)
        path.append(Waypoint(pos=hover_pos, pose=camera_pose, hover=5))
    # TSP 优化访问顺序
    return optimize_tsp(path)</code></pre>
<h2 id="sec-3">三、缺陷识别：从分类到检测到分割</h2>
<p>不同缺陷类型需要不同任务范式。裂缝用实例分割（Mask R-CNN），锈蚀用语义分割，绝缘子破损用目标检测（YOLO）。我们的策略是搭建多模型推理服务，一次飞行采集的图片自动分发到对应模型。在 2000 张桥梁缺陷数据集上，YOLOv8 的 mAP 达到 0.82。</p>
<h2 id="sec-4">四、边缘计算与实时回传</h2>
<p>桥梁巡检常在山区，4G 信号不稳定。我们在无人机端部署边缘 AI 模块（Jetson Orin），飞行过程中实时识别缺陷并标记 GPS 坐标。只有疑似缺陷的高清图回传云端，原始视频存本地存储。这样既保证了实时性，又降低了通讯带宽压力。</p>
<h2 id="sec-5">五、从"巡"到"检"到"评"</h2>
<p>巡检的闭环不是"发现了缺陷"，而是"评估了缺陷的严重程度并给出维修建议"。我们做了缺陷知识图谱，把识别出的缺陷关联到规范条文（如《公路桥梁技术状况评定标准》），自动计算构件的技术状况评分，生成维修优先级建议。这一步让巡检从"拍照报告"升级为"决策支持"。</p>
<h2 id="sec-6">结语</h2>
<p>无人机 + AI 巡检的成熟度，已经可以让它从"试点"走向"标配"。但落地的关键不是单点技术突破，而是"航迹—识别—评估—工单"的全链路打通。技术再先进，最后都要回到工程管理的闭环里。</p>
`,
  },
  {
    id: 7,
    tag: "frontier",
    tagLabel: "前沿技术",
    title: "图神经网络在结构健康监测中的应用",
    desc: "把传感器读数和构件拓扑一起喂给 GNN，让结构损伤定位更准。",
    img: "https://images.unsplash.com/photo-1517089596392-fb9a9033e05b?q=80&w=1200&auto=format&fit=crop",
    color: "#06b6d4",
    date: "2026-04-22",
    featured: false,
    body: `
<p>结构健康监测（SHM）传统方法是基于振动信号的模态分析，能识别整体损伤但难定位。图神经网络（GNN）天然适合表达构件之间的拓扑关系，为损伤定位提供了新思路。</p>
<h2 id="sec-1">一、为什么是图</h2>
<p>结构本质上是图——节点是构件（梁、柱、节点），边是连接关系。传统方法把传感器信号当独立序列处理，丢失了空间拓扑信息。GNN 在节点特征（传感器读数）上做消息传递，让每个节点的表征融合了邻居信息，损伤的局部特征会通过图结构传播，从而可定位。</p>
<blockquote>结构的健康，不是某个传感器的读数，而是所有读数之间的关系。图，是表达关系的语言。</blockquote>
<h2 id="sec-2">二、图构建</h2>
<p>从 BIM 模型提取构件节点，连接关系作为边。传感器作为节点的特征来源——一个构件上可能有多个传感器，做特征聚合。没有传感器的构件，特征用邻居聚合后的隐表征（这就是 GNN 的半监督能力）。</p>
<h2 id="sec-3">三、模型设计</h2>
<p>用 GraphSAGE 做节点表征学习，输入是每个时间窗口的传感器统计特征（均值、方差、峰值、功率谱密度），输出是每个节点的损伤概率。</p>
<pre><code>import torch
import torch_geometric.nn as gnn

class DamageLocalizer(torch.nn.Module):
    def __init__(self, in_dim, hidden=64):
        super().__init__()
        self.conv1 = gnn.SAGEConv(in_dim, hidden)
        self.conv2 = gnn.SAGEConv(hidden, hidden)
        self.classify = torch.nn.Linear(hidden, 2)  # 健康/损伤

    def forward(self, x, edge_index):
        h = torch.relu(self.conv1(x, edge_index))
        h = torch.relu(self.conv2(h, edge_index))
        return self.classify(h)  # 每个节点的损伤概率</code></pre>
<h2 id="sec-4">四、损伤敏感性</h2>
<p>GNN 对小损伤的敏感性优于纯信号方法。原因在于图结构放大了局部异常的影响——一个节点的特征异常会通过边传播，让相邻节点的表征也发生变化，这种"涟漪效应"让损伤更易被识别。在有限元仿真数据上，GNN 对 5% 刚度退化的损伤识别准确率 89%，而纯 CNN 只有 71%。</p>
<h2 id="sec-5">结语</h2>
<p>GNN 在 SHM 中还处于研究阶段，离工程落地有距离。但它指明了一个方向：把结构的物理拓扑纳入学习框架，比单纯堆数据量更有效。当 BIM 普及后，图构建的成本会大幅降低，GNN 的工程价值才会真正释放。</p>
`,
  },
  {
    id: 8,
    tag: "ai-app",
    tagLabel: "AI 应用",
    title: "RAG + 工程规范：搭建工程知识助手",
    desc: "工程规范浩如烟海，用 RAG 让 AI 成为能精准引用条文的工程顾问。",
    img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200&auto=format&fit=crop",
    color: "#ec4899",
    date: "2026-04-15",
    featured: true,
    body: `
<p>工程师查规范是高频痛点。一本规范几百页，项目涉及几十本规范，人工检索效率低、易遗漏。RAG（检索增强生成）让大模型在回答时引用规范原文，是把 LLM 变成"工程知识助手"的关键技术。</p>
<h2 id="sec-1">一、为什么工程规范需要 RAG</h2>
<p>通用大模型的工程知识不准确，因为它训练数据里规范的比重低，且规范更新频繁。直接让大模型回答工程问题，会出现"幻觉条文"——编造一个看起来像规范但不存在的条款。这在工程场景是致命的。RAG 的价值是让模型"先检索规范原文，再基于原文回答"，把幻觉率从 30% 降到 5% 以下。</p>
<blockquote>工程领域的 AI，准确性不是加分项，是底线。一条错的规范引用，可能就是一条人命。</blockquote>
<h2 id="sec-2">二、规范文档的处理</h2>
<p>规范是结构化文档，章节、条文、注释层级清晰。直接整篇切 chunk 会破坏条文的完整性。我们用规则解析把规范拆成"条文级"单元，每个单元保留章节路径作为元数据。</p>
<pre><code>def parse_specification(pdf_path):
    doc = load_pdf(pdf_path)
    clauses = []
    for page in doc:
        # 识别条文编号模式，如 3.2.1、第 5.3 条
        matches = find_clause_patterns(page.text)
        for m in matches:
            clause = {
                'id': m.number,           # '3.2.1'
                'title': m.title,
                'content': m.body,
                'chapter': m.chapter,     # '第3章'
                'spec': doc.title,        # 规范名称
                'page': page.number,
            }
            clauses.append(clause)
    return clauses</code></pre>
<h2 id="sec-3">三、向量检索的调优</h2>
<p>通用 embedding 模型在工程术语上表现一般。我们的做法：用工程领域语料微调 bge-m3 模型，提升"防火分区"和"防火区"这种近义但不同概念的区分度。检索时用混合检索：向量检索（语义）+ BM25（关键词），结果用 reciprocal rank fusion 融合。</p>
<h2 id="sec-4">四、回答生成的工程化</h2>
<p>提示词设计是关键。我们要求模型：每个结论必须引用规范条文编号，无法引用时明确说"未找到相关规范"，禁止编造。回答格式固定为"结论 + 依据条文 + 解释"三段式。这样工程师能快速核验。</p>
<h2 id="sec-5">五、闭环与迭代</h2>
<p>系统上线后，收集工程师的反馈（回答是否有用、引用是否准确），把高质量问答对加入知识库做二次训练。3 个月迭代后，引用准确率从 78% 提升到 94%。</p>
<h2 id="sec-6">结语</h2>
<p>RAG 不是银弹，但在工程规范这种"准确性压倒一切"的场景，它是当下最务实的方案。当知识库积累到覆盖主要规范后，工程知识助手会从"查规范工具"进化为"设计校核伙伴"。</p>
`,
  },
  {
    id: 9,
    tag: "energy",
    tagLabel: "能源工程",
    title: "建筑碳排放核算的自动化方案",
    desc: "从建材生产到运维拆除，全生命周期碳排核算如何用 AI 提效。",
    img: "https://images.unsplash.com/photo-1473773508845-188df298d2d1?q=80&w=1200&auto=format&fit=crop",
    color: "#22c55e",
    date: "2026-04-08",
    featured: false,
    body: `
<p>"双碳"目标下，建筑碳排放核算从可选项变成必选项。但全生命周期碳排（LCA）核算涉及建材生产、施工、运维、拆除四个阶段，数据量大、计算复杂，人工核算一个中型项目要 2-3 周。自动化是必然趋势。</p>
<h2 id="sec-1">一、碳排核算的四阶段</h2>
<p>建材生产阶段（占比最大，60-70%）：钢筋、水泥、玻璃的隐含碳。施工阶段：机械能耗、运输。运维阶段：电、气、冷的能耗碳排。拆除阶段：拆除能耗 + 材料回收抵扣。每个阶段都有对应的碳排放因子数据库（如中国建筑碳排放因子库）。</p>
<blockquote>碳排核算的难点不在公式，在数据。建材的碳排因子，不同来源能差 30%。</blockquote>
<h2 id="sec-2">二、从 BIM 自动提取算量</h2>
<p>传统算量靠人工读图纸。我们用 IfcOpenDDL 从 BIM 模型提取构件清单（BOQ），每个构件的材质、体积、重量自动获取，匹配碳排因子库后自动计算建材碳排。</p>
<pre><code>def compute_embodied_carbon(bim_model, factor_db):
    total = 0
    for element in bim_model.elements:
        material = element.material  # 'C30混凝土'
        volume = element.volume       # m³
        # 查碳排因子（kgCO2e/m³）
        factor = factor_db.lookup(material, unit='m³')
        total += volume * factor
    return total  # kgCO2e</code></pre>
<h2 id="sec-3">三、运维碳排的预测</h2>
<p>运维阶段碳排依赖能耗预测（前文讲过 LSTM 能耗模型）。把预测能耗乘以电网碳排因子（每年不同，需查区域电网基准线），得到运维碳排。25 年运维周期的累计碳排往往接近建材碳排。</p>
<h2 id="sec-4">四、AI 在碳排优化中的角色</h2>
<p>核算只是第一步，优化才是价值。我们用多目标优化（NSGA-II）在"碳排最低"和"成本最低"之间找 Pareto 前沿。比如：用高性能混凝土减少水泥用量能降碳，但成本上升；用木结构替代钢结构碳排更低，但防火限制多。AI 帮工程师在约束空间里找到最优解。</p>
<h2 id="sec-5">结语</h2>
<p>碳排核算的自动化，是建筑行业走向绿色化的基础设施。当每个项目都能快速给出全生命周期碳排报告时，"低碳建筑"才不再是一句口号，而是一个可比较、可优化、可监管的指标。</p>
`,
  },
  {
    id: 10,
    tag: "ai-app",
    tagLabel: "AI 应用",
    title: "工程项目管理中的 AI 预警系统",
    desc: "进度延误、成本超支、安全事故，用 AI 把事后复盘变成事前预警。",
    img: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=1200&auto=format&fit=crop",
    color: "#a855f7",
    date: "2026-03-30",
    featured: false,
    body: `
<p>工程项目管理的三大目标——进度、成本、安全——都依赖"发现问题"的能力。但传统管理是事后复盘：延误了才知道延误，超支了才发现超支。AI 预警系统的目标，是把"事后"前置到"事前"。</p>
<h2 id="sec-1">一、进度预警：关键路径的动态预测</h2>
<p>传统关键路径法（CPM）是静态的，假设工序工期确定。但实际工期有不确定性。我们用蒙特卡洛模拟 + 历史项目数据训练的工期预测模型，每天更新关键路径的概率分布，当某工序延误概率超过阈值时自动预警。</p>
<blockquote>预警的价值不在于"准"，而在于"早"。提前一周知道要延误，比事后精确知道延误多少更有用。</blockquote>
<h2 id="sec-2">二、成本预警：挣值分析的 AI 增强</h2>
<p>挣值分析（EVM）是经典的成本监控方法，但它只能反映已发生的偏差。我们用 LSTM 预测剩余工作的成本趋势，结合已发生的偏差，预测项目最终成本（EAC）。当预测 EAC 超过预算 5% 时触发预警。</p>
<h2 id="sec-3">三、安全预警：多源数据融合</h2>
<p>安全事故的预测最复杂，因为样本少、特征散。我们融合三类数据：工人行为（智能安全帽的轨迹和姿态）、环境（气象、光照）、管理（班前会记录、交底情况）。用图注意力网络（GAT）建模工人-区域-工序的关联，识别高风险组合。</p>
<pre><code># 安全风险评分的简化逻辑
def compute_risk_score(workers, zone, task, env):
    behavior_risk = analyze_trajectories(workers)  # 是否违规进入危险区
    env_risk = assess_environment(env)             # 风速、能见度
    task_risk = task_hazard_level(task)            # 高处作业？动火？
    mgmt_risk = 1 - safety_meeting_compliance      # 班前会是否落实
    # 加权融合，权重来自历史事故数据训练
    return w1*behavior_risk + w2*env_risk + w3*task_risk + w4*mgmt_risk</code></pre>
<h2 id="sec-4">四、预警的"狼来了"问题</h2>
<p>预警系统最大的风险是误报率高，导致管理者忽视。我们的经验是分级预警：黄色预警（关注）、橙色预警（响应）、红色预警（停工）。阈值要保守，宁可少报不可乱报。系统上线半年后，红色预警的准确率维持在 70% 以上，才赢得了管理者的信任。</p>
<h2 id="sec-5">结语</h2>
<p>AI 预警系统不是要替代项目经理，而是给项目经理一双"能看见未来"的眼睛。当预警从"猜"变成"算"，工程管理的范式才真正从经验主义走向数据主义。</p>
`,
  },
  {
    id: 11,
    tag: "frontier",
    tagLabel: "前沿技术",
    title: "扩散模型生成建筑方案：可能性与边界",
    desc: "AI 能画效果图，但能做方案设计吗？拆解扩散模型在建筑生成中的能力边界。",
    img: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop",
    color: "#d946ef",
    date: "2026-03-18",
    featured: false,
    body: `
<p>Midjourney 画的建筑效果图已经能骗过专业评审，但"画效果图"和"做方案设计"是两回事。扩散模型在建筑生成中的真实能力边界在哪？</p>
<h2 id="sec-1">一、扩散模型能做什么</h2>
<p>当前扩散模型（Stable Diffusion、ControlNet）在建筑领域最强的能力是"风格化生成"——给定功能布局，生成多种风格的立面效果。这对前期方案比选很有用，5 分钟出 20 个立面方向，人工画要一周。</p>
<blockquote>AI 生成的不是建筑，是建筑的图像。这个区别，决定了它能做什么、不能做什么。</blockquote>
<h2 id="sec-2">二、ControlNet 的工程化用法</h2>
<p>纯文本生成不可控，建筑师需要的是"基于平面图生立面""基于体块生效果图"。ControlNet 通过条件输入（线稿、深度图、分割图）约束生成，是建筑生成走向可控的关键。我们用功能分区图作为条件，生成多个立面方案，再让设计师挑选细化。</p>
<pre><code># ControlNet 建筑生成的伪代码
from diffusers import ControlNetModel, StableDiffusionControlNetPipeline

controlnet = ControlNetModel.from_pretrained("lllyasviel/sd-controlnet-seg")
pipe = StableDiffusionControlNetPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5", controlnet=controlnet
)

# 输入：功能分区图 + 提示词
segmentation = load_floor_plan_seg("plan.png")
prompt = "modern office building, glass facade, 8 floors, architectural rendering"
images = pipe(prompt, image=segmentation, num_images=4).images</code></pre>
<h2 id="sec-3">三、不能做什么：结构的真实性</h2>
<p>扩散模型生成的图，结构逻辑常常是错的——悬挑过大、柱跨不合理、立面与功能不符。因为它学的是"图像的统计规律"，不是"结构的物理规律"。把 AI 生成的图直接当施工图，会出大问题。</p>
<h2 id="sec-4">四、人机协同的工作流</h2>
<p>务实的路径是人机协同：AI 负责"发散"（快速生成多个方向），人负责"收敛"（基于规范和经验筛选、深化）。我们的工作流是：建筑师定功能 → AI 生成 20 个立面 → 建筑师选 3 个 → AI 细化 → 建筑师最终确认。这样既发挥了 AI 的效率，又保留了人的判断。</p>
<h2 id="sec-5">结语</h2>
<p>扩散模型在建筑生成的价值，是降低"探索成本"，不是替代"设计判断"。当 AI 能把方案发散的时间从一周压到一小时，设计师的时间就能从"画图"解放到"思考"。这才是技术对设计真正的赋能。</p>
`,
  },
  {
    id: 12,
    tag: "tools",
    tagLabel: "工具推荐",
    title: "工程人必会的 10 个 AI 工具推荐",
    desc: "从图纸解析到现场协同，工程人提升效率的 10 个实用 AI 工具盘点。",
    img: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=1200&auto=format&fit=crop",
    color: "#14b8a6",
    date: "2026-03-10",
    featured: false,
    body: `
<p>AI 工具不是程序员的专属，工程人同样能用 AI 大幅提效。这篇盘点 10 个我们在实际项目中验证过、对工程人真正有用的 AI 工具。</p>
<h2 id="sec-1">一、图纸与文档类</h2>
<p><strong>1. ChatPDF / Kimi</strong>——长文档对话。规范、标书、合同动辄几百页，用这些工具可以快速提取关键条款、对比版本差异。Kimi 对中文长文档的支持尤其好。</p>
<p><strong>2. Mathpix</strong>——公式与表格识别。把规范里的公式、表格截图转成 LaTeX 或 Excel，告别手敲。对结构工程师做计算书极有用。</p>
<blockquote>工具的价值，不在多，在"用顺"。一个工具用透，比十个工具浅尝强百倍。</blockquote>
<h2 id="sec-2">二、设计与分析类</h2>
<p><strong>3. Stable Diffusion + ControlNet</strong>——建筑效果图生成。前期方案比选的神器，详见我另一篇文章《扩散模型生成建筑方案》。</p>
<p><strong>4. GitHub Copilot</strong>——写脚本提效。工程人越来越多需要写 Python 做数据处理（BIM 二次开发、数据分析），Copilot 能把写脚本时间砍掉一半。</p>
<p><strong>5. Wolfram Alpha</strong>——工程计算验算。复杂积分、微分方程、单位换算，比手算和 Excel 都快且准。</p>
<h2 id="sec-3">三、现场与管理类</h2>
<p><strong>6. 飞书妙记 / 钉钉闪记</strong>——会议纪要自动生成。现场协调会、图纸会审，录音自动转文字 + 总结待办，再也不用专人记纪要。</p>
<p><strong>7. Notion AI</strong>——知识管理。项目经验、技术总结、交底文档，用 Notion AI 整理和检索，比传统文件夹结构高效。</p>
<h2 id="sec-4">四、数据处理类</h2>
<p><strong>8. Code Interpreter (ChatGPT)</strong>——数据分析。上传监测数据 Excel，让它帮你画图、找异常、做统计，不用写一行代码。</p>
<p><strong>9. Tables.jl / Pandas AI</strong>——结构化数据对话。对工程监测数据做交互式分析，自然语言提问，自动生成图表。</p>
<h2 id="sec-5">五、设计与表达类</h2>
<p><strong>10. Gamma / 美图设计室 AI</strong>——汇报材料生成。方案汇报、技术交底 PPT，输入大纲自动生成排版，比从零做 PPT 快十倍。</p>
<h2 id="sec-6">结语</h2>
<p>工具是杠杆，但杠杆的支点是"人"。再好的工具，也需要工程师知道"用它解决什么问题"。建议从最痛的场景入手——如果你每周都在手动整理监测数据，就从 Code Interpreter 开始；如果你被规范检索折磨，就从 Kimi 开始。用顺一个，再扩展下一个。</p>
`,
  },
];

export function getFeaturedArticles(): Article[] {
  return articles.filter((a) => a.featured);
}

export function getArticleById(id: number): Article | undefined {
  return articles.find((a) => a.id === id);
}

export function getRelatedArticles(article: Article, count = 3): Article[] {
  const sameTag = articles.filter(
    (a) => a.id !== article.id && a.tag === article.tag
  );
  const others = articles.filter(
    (a) => a.id !== article.id && a.tag !== article.tag
  );
  return [...sameTag, ...others].slice(0, count);
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export function computeReadTime(body: string): number {
  const text = body.replace(/<[^>]+>/g, "");
  const charCount = text.length;
  return Math.max(3, Math.round(charCount / 350));
}
