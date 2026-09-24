(() => {
  const STORAGE_KEY = "support-workbench-demo-v1";
  const CURRENT_AGENT = "林晓";
  const ASSIGNEES = ["林晓", "陈婧", "王睿", "未分配"];
  const sampleTickets = [
    { id:"CW-2048", customer:"周雨晴", email:"yq.zhou@example.com", initials:"周", color:"#e4edff", subject:"订单已经发货，如何修改收货地址？", channel:"在线聊天", status:"open", assignee:"林晓", location:"上海，中国", since:"2024年 6月", conversations:4, note:"偏好通过在线聊天联系。最近关注企业版方案。", updated:Date.now()-4*60*1000, messages:[{sender:"周雨晴",type:"customer",time:"10:24",text:"你好，我刚看到订单已经发货了，但是地址填成旧地址了，还能修改吗？"},{sender:"林晓",type:"agent",time:"10:26",text:"你好雨晴，我来帮你确认一下。请问订单号是 NS-48291 吗？我先查看一下物流状态。"},{sender:"周雨晴",type:"customer",time:"10:27",text:"对的，就是这个订单。谢谢！"}] },
    { id:"CW-2047", customer:"陈嘉宁", email:"jianing.chen@example.com", initials:"陈", color:"#ffebdf", subject:"发票抬头信息需要更新", channel:"邮件", status:"open", assignee:"陈婧", location:"杭州，中国", since:"2025年 2月", conversations:2, note:"公司采购联系人，工作日回复较快。", updated:Date.now()-21*60*1000, messages:[{sender:"陈嘉宁",type:"customer",time:"09:56",text:"您好，刚才购买的专业版可以帮忙把发票抬头改成「杭州嘉宁科技有限公司」吗？"},{sender:"陈婧",type:"agent",time:"10:01",text:"当然可以。麻烦把纳税人识别号也发给我，我会为您重新开具。"}] },
    { id:"CW-2046", customer:"许安然", email:"aran.xu@example.com", initials:"许", color:"#f5e6ff", subject:"新版本上线后同步速度变慢了", channel:"微信", status:"pending", assignee:"林晓", location:"成都，中国", since:"2024年 11月", conversations:7, note:"高级用户，主要在 Windows 客户端使用。", updated:Date.now()-58*60*1000, messages:[{sender:"许安然",type:"customer",time:"09:16",text:"今天更新以后，同步一条记录要等好几秒，是正常的吗？"},{sender:"王睿",type:"agent",time:"09:20",text:"抱歉给你带来不便。我已经把情况交给技术同事排查，会在今天内更新进度。"}] },
    { id:"CW-2045", customer:"林沐", email:"mu.lin@example.com", initials:"林", color:"#e3f5eb", subject:"团队空间成员邀请失败", channel:"在线聊天", status:"open", assignee:"未分配", location:"深圳，中国", since:"2026年 1月", conversations:1, note:"新注册用户。", updated:Date.now()-2*60*60*1000, messages:[{sender:"林沐",type:"customer",time:"08:32",text:"我邀请同事加入团队空间，但是他一直没有收到邮件。垃圾邮件里也没有。"}] },
    { id:"CW-2044", customer:"赵思远", email:"siyuan.zhao@example.com", initials:"赵", color:"#fff0d7", subject:"是否支持按月导出使用报表？", channel:"邮件", status:"resolved", assignee:"王睿", location:"北京，中国", since:"2025年 7月", conversations:3, note:"关心数据分析功能。", updated:Date.now()-5*60*60*1000, messages:[{sender:"赵思远",type:"customer",time:"昨天 16:08",text:"请问管理员能不能按月导出团队的使用报表？"},{sender:"王睿",type:"agent",time:"昨天 16:15",text:"可以的。进入「设置 - 数据分析」，选择日期范围后点击导出即可。"}] },
    { id:"CW-2043", customer:"宋可欣", email:"kexin.song@example.com", initials:"宋", color:"#fce4ee", subject:"感谢你们快速处理退款", channel:"微信", status:"resolved", assignee:"林晓", location:"南京，中国", since:"2025年 10月", conversations:5, note:"近期申请过退款。", updated:Date.now()-24*60*60*1000, messages:[{sender:"宋可欣",type:"customer",time:"昨天 11:42",text:"退款已经收到了，处理得很快，谢谢！"},{sender:"林晓",type:"agent",time:"昨天 11:45",text:"很高兴问题解决了，之后需要帮助随时联系我们。"}] }
  ];

  const $ = (selector) => document.querySelector(selector);
  const els = {
    root:$(".app-shell"), list:$("#ticket-list"), listEmpty:$("#list-empty"), search:$("#search"), channel:$("#channel-filter"), statusFilter:$("#status-filter"),
    conversation:$("#conversation"), noSelection:$("#no-selection"), contact:$("#contact-panel"), messages:$("#message-thread"), composer:$("#composer"), draft:$("#draft"),
    assignee:$("#assignee"), status:$("#ticket-status"), resolve:$("#resolve-button"), allCount:$("#all-count"), draftHint:$("#draft-hint")
  };
  let tickets = loadTickets();
  let selectedId = tickets.find((ticket) => ticket.status === "open")?.id || tickets[0]?.id || null;
  let activeView = "all";
  let messageMode = "reply";

  function loadTickets() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return structuredClone(sampleTickets);
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed) || parsed.some((ticket) => !ticket || typeof ticket.id !== "string" || typeof ticket.customer !== "string" || typeof ticket.subject !== "string" || !Array.isArray(ticket.messages))) {
        const restored = structuredClone(sampleTickets);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(restored));
        return restored;
      }
      return parsed;
    } catch {
      const restored = structuredClone(sampleTickets);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(restored)); } catch { /* Storage may be disabled. */ }
      return restored;
    }
  }

  function saveTickets() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets)); }
    catch { window.alert("浏览器无法保存演示数据。请检查本地存储空间或隐私设置。"); }
  }

  function initials(name) { return Array.from(name || "?").slice(0, 1).join(""); }
  function statusLabel(status) { return ({open:"处理中",pending:"待回复",resolved:"已解决"})[status] || "处理中"; }
  function timeAgo(timestamp) {
    const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
    if (minutes < 1) return "刚刚";
    if (minutes < 60) return `${minutes} 分钟前`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} 小时前`;
    return `${Math.floor(minutes / 1440)} 天前`;
  }
  function create(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function visibleTickets() {
    const query = els.search.value.trim().toLocaleLowerCase();
    return tickets.filter((ticket) => {
      const matchesView = activeView === "all" || ticket.assignee === CURRENT_AGENT;
      const matchesStatus = els.statusFilter.value === "all" || ticket.status === els.statusFilter.value;
      const matchesChannel = els.channel.value === "all" || ticket.channel === els.channel.value;
      const searchable = [ticket.customer, ticket.email, ticket.subject, ...ticket.messages.map((message) => message.text)].join(" ").toLocaleLowerCase();
      return matchesView && matchesStatus && matchesChannel && (!query || searchable.includes(query));
    }).sort((a,b) => b.updated - a.updated);
  }

  function renderList() {
    const visible = visibleTickets();
    els.list.replaceChildren();
    els.allCount.textContent = String(tickets.filter((ticket) => ticket.status !== "resolved").length);
    for (const ticket of visible) {
      const card = create("button", `ticket-card${ticket.id === selectedId ? " selected" : ""}`);
      card.type = "button";
      card.setAttribute("aria-pressed", String(ticket.id === selectedId));
      const top = create("span", "ticket-line");
      const name = create("strong", "", ticket.customer);
      const time = create("span", "ticket-time", timeAgo(ticket.updated));
      top.append(name, time);
      const subject = create("span", "ticket-subject", ticket.subject);
      const latest = ticket.messages[ticket.messages.length - 1];
      const preview = create("span", "ticket-preview", latest ? latest.text : "还没有消息");
      const footer = create("span", "ticket-footer");
      const dot = create("i", `status-dot ${ticket.status}`);
      const channel = create("span", "ticket-assignee", ticket.channel);
      const spacer = create("i", "footer-spacer");
      const agent = create("span", "ticket-assignee", ticket.assignee === "未分配" ? "未分配" : ticket.assignee);
      footer.append(dot, channel, spacer, agent);
      card.append(top, subject, preview, footer);
      card.addEventListener("click", () => { selectedId = ticket.id; render(); });
      els.list.append(card);
    }
    els.listEmpty.classList.toggle("hidden", visible.length > 0);
  }

  function renderMessages(ticket) {
    els.messages.replaceChildren();
    const date = create("div", "thread-date", "今天");
    els.messages.append(date);
    for (const message of ticket.messages) {
      const isAgent = message.type === "agent" || message.type === "note";
      const row = create("article", `message-row${isAgent ? " agent" : ""}${message.type === "note" ? " note" : ""}`);
      const avatar = create("span", "message-avatar", initials(message.sender));
      const content = create("div", "message-content");
      const head = create("div", "message-head", `${message.sender} · ${message.time}`);
      const bubble = create("div", "bubble");
      if (message.type === "note") bubble.append(create("div", "note-label", "仅团队可见"));
      bubble.append(document.createTextNode(message.text));
      content.append(head, bubble);
      row.append(avatar, content);
      els.messages.append(row);
    }
    els.messages.scrollTop = els.messages.scrollHeight;
  }

  function renderDetails(ticket) {
    if (!ticket) {
      els.conversation.classList.add("hidden");
      els.contact.classList.add("hidden");
      els.noSelection.classList.remove("hidden");
      els.root.classList.remove("show-conversation");
      return;
    }
    els.noSelection.classList.add("hidden");
    els.conversation.classList.remove("hidden");
    els.contact.classList.remove("hidden");
    els.root.classList.add("show-conversation");
    $("#customer-avatar").textContent = ticket.initials || initials(ticket.customer);
    $("#customer-avatar").style.background = ticket.color || "#e5e9ff";
    $("#customer-name").textContent = ticket.customer;
    $("#customer-meta").textContent = `${ticket.channel} · ${ticket.email}`;
    $("#ticket-subject").textContent = ticket.subject;
    $("#ticket-id").textContent = ticket.id;
    $("#channel-pill").textContent = ticket.channel;
    els.status.value = ticket.status;
    els.resolve.textContent = ticket.status === "resolved" ? "重新打开" : "标记已解决";
    els.assignee.replaceChildren();
    for (const name of ASSIGNEES) {
      const option = create("option", "", name);
      option.value = name;
      els.assignee.append(option);
    }
    els.assignee.value = ASSIGNEES.includes(ticket.assignee) ? ticket.assignee : "未分配";
    $("#profile-avatar").textContent = ticket.initials || initials(ticket.customer);
    $("#profile-avatar").style.background = ticket.color || "#e5e9ff";
    $("#profile-name").textContent = ticket.customer;
    $("#profile-email").textContent = ticket.email;
    $("#profile-location").textContent = ticket.location || "未提供";
    $("#profile-since").textContent = ticket.since || "未提供";
    $("#profile-conversations").textContent = `${ticket.conversations || 1} 次`;
    $("#profile-note").textContent = ticket.note || "暂无备注";
    renderMessages(ticket);
  }

  function render() {
    if (selectedId && !tickets.some((ticket) => ticket.id === selectedId)) selectedId = null;
    renderList();
    renderDetails(tickets.find((ticket) => ticket.id === selectedId));
  }

  function updateSelected(update) {
    const ticket = tickets.find((entry) => entry.id === selectedId);
    if (!ticket) return;
    update(ticket);
    ticket.updated = Date.now();
    saveTickets();
    render();
  }

  document.querySelectorAll(".tab").forEach((tab) => tab.addEventListener("click", () => {
    activeView = tab.dataset.view;
    document.querySelectorAll(".tab").forEach((item) => item.classList.toggle("active", item === tab));
    renderList();
  }));
  [els.search, els.channel, els.statusFilter].forEach((control) => control.addEventListener("input", renderList));
  els.status.addEventListener("change", () => updateSelected((ticket) => { ticket.status = els.status.value; }));
  els.assignee.addEventListener("change", () => updateSelected((ticket) => { ticket.assignee = els.assignee.value; }));
  els.resolve.addEventListener("click", () => updateSelected((ticket) => { ticket.status = ticket.status === "resolved" ? "open" : "resolved"; }));

  document.querySelectorAll(".mode-button").forEach((button) => button.addEventListener("click", () => {
    messageMode = button.dataset.mode;
    document.querySelectorAll(".mode-button").forEach((item) => item.classList.toggle("active", item === button));
    els.draft.placeholder = messageMode === "note" ? "输入仅团队可见的备注…" : "输入回复内容…";
    els.draftHint.textContent = messageMode === "note" ? "仅团队成员可以看到这条备注" : "客户将会收到这条消息";
  }));

  els.composer.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = els.draft.value.trim();
    if (!text) { els.draft.focus(); return; }
    const ticket = tickets.find((entry) => entry.id === selectedId);
    if (!ticket) return;
    const now = new Date();
    ticket.messages.push({ sender:CURRENT_AGENT, type:messageMode === "note" ? "note" : "agent", time:now.toLocaleTimeString("zh-CN", {hour:"2-digit", minute:"2-digit"}), text });
    if (messageMode === "reply") ticket.status = "pending";
    ticket.assignee = ticket.assignee === "未分配" ? CURRENT_AGENT : ticket.assignee;
    ticket.updated = Date.now();
    saveTickets();
    els.draft.value = "";
    render();
  });
  els.draft.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); els.composer.requestSubmit(); }
  });
  $("#reset-data").addEventListener("click", () => {
    if (!window.confirm("将当前浏览器里的演示对话恢复为初始数据？此操作无法撤销。")) return;
    tickets = structuredClone(sampleTickets);
    selectedId = tickets.find((ticket) => ticket.status === "open")?.id || null;
    activeView = "all";
    els.search.value = ""; els.channel.value = "all"; els.statusFilter.value = "open";
    document.querySelectorAll(".tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.view === "all"));
    saveTickets(); render();
  });
  $("#back-to-inbox").addEventListener("click", () => els.root.classList.remove("show-conversation"));
  render();
})();
