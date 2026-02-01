// 日程管理系统 - 带用户认证功能

// 用户认证管理类
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.users = this.loadUsers();
        this.initAuthElements();
        this.bindAuthEvents();
        this.checkLoginStatus();
    }
    
    // 初始化认证相关DOM元素
    initAuthElements() {
        // 认证页面元素
        this.authPage = document.getElementById('authPage');
        this.appMain = document.getElementById('appMain');
        
        // 登录表单元素
        this.loginFormContainer = document.getElementById('loginFormContainer');
        this.loginForm = document.getElementById('loginForm');
        this.loginPhoneInput = document.getElementById('loginPhone');
        this.loginPasswordInput = document.getElementById('loginPassword');
        
        // 注册表单元素
        this.registerFormContainer = document.getElementById('registerFormContainer');
        this.registerForm = document.getElementById('registerForm');
        this.registerUsernameInput = document.getElementById('registerUsername');
        this.registerPhoneInput = document.getElementById('registerPhone');
        this.registerPasswordInput = document.getElementById('registerPassword');
        this.registerConfirmPasswordInput = document.getElementById('registerConfirmPassword');
        
        // 表单切换按钮
        this.showRegisterFormBtn = document.getElementById('showRegisterForm');
        this.showLoginFormBtn = document.getElementById('showLoginForm');
        
        // 主应用元素
        this.logoutBtn = document.getElementById('logoutBtn');
        this.currentUserPhoneElement = document.getElementById('currentUserPhone');
        this.currentUsernameElement = document.getElementById('currentUsername');
        this.editUsernameBtn = document.getElementById('editUsernameBtn');
        
        // 修改用户名模态框元素
        this.editUsernameModal = document.getElementById('editUsernameModal');
        this.closeEditUsernameModalBtn = document.getElementById('closeEditUsernameModal');
        this.cancelEditUsernameBtn = document.getElementById('cancelEditUsername');
        this.editUsernameForm = document.getElementById('editUsernameForm');
        this.newUsernameInput = document.getElementById('newUsername');
    }
    
    // 绑定认证相关事件
    bindAuthEvents() {
        // 表单切换事件
        this.showRegisterFormBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.switchForm('register');
        });
        
        this.showLoginFormBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.switchForm('login');
        });
        
        // 表单提交事件
        this.loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
        
        this.registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });
        
        // 登出事件
        this.logoutBtn.addEventListener('click', () => {
            this.handleLogout();
        });
        
        // 修改用户名事件
        this.editUsernameBtn.addEventListener('click', () => {
            this.showEditUsernameModal();
        });
        
        // 修改用户名表单提交事件
        this.editUsernameForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateUsername();
        });
        
        this.closeEditUsernameModalBtn.addEventListener('click', () => {
            this.hideEditUsernameModal();
        });
        
        this.cancelEditUsernameBtn.addEventListener('click', () => {
            this.hideEditUsernameModal();
        });
    }
    
    // 切换表单显示
    switchForm(formType) {
        if (formType === 'login') {
            this.loginFormContainer.classList.add('active');
            this.registerFormContainer.classList.remove('active');
        } else {
            this.loginFormContainer.classList.remove('active');
            this.registerFormContainer.classList.add('active');
        }
    }
    
    // 验证手机号码格式
    validatePhone(phone) {
        const phoneRegex = /^1[3-9]\d{9}$/;
        return phoneRegex.test(phone);
    }
    
    // 验证密码格式
    validatePassword(password) {
        return password.length >= 6 && password.length <= 20;
    }
    
    // 验证用户名格式
    validateUsername(username) {
        return username.length >= 2 && username.length <= 12;
    }
    
    // 处理用户注册
    handleRegister() {
        const username = this.registerUsernameInput.value.trim();
        const phone = this.registerPhoneInput.value.trim();
        const password = this.registerPasswordInput.value;
        const confirmPassword = this.registerConfirmPasswordInput.value;
        
        // 验证输入
        if (!this.validateUsername(username)) {
            alert('用户名长度必须在2-12位之间');
            return;
        }
        
        if (!this.validatePhone(phone)) {
            alert('请输入有效的手机号码');
            return;
        }
        
        if (!this.validatePassword(password)) {
            alert('密码长度必须在6-20位之间');
            return;
        }
        
        if (password !== confirmPassword) {
            alert('两次输入的密码不一致');
            return;
        }
        
        // 检查用户是否已存在
        if (this.users[phone]) {
            alert('该手机号码已注册');
            return;
        }
        
        // 创建新用户
        this.users[phone] = {
            username: username,
            phone: phone,
            password: password, // 实际项目中应使用加密存储
            createdAt: new Date().toISOString()
        };
        
        // 保存用户数据
        this.saveUsers();
        
        // 注册成功后自动登录
        this.currentUser = this.users[phone];
        this.saveCurrentUser();
        this.showApp();
    }
    
    // 处理用户登录
    handleLogin() {
        const phone = this.loginPhoneInput.value.trim();
        const password = this.loginPasswordInput.value;
        
        // 验证输入
        if (!this.validatePhone(phone)) {
            alert('请输入有效的手机号码');
            return;
        }
        
        // 检查用户是否存在
        const user = this.users[phone];
        if (!user) {
            alert('该手机号码未注册');
            return;
        }
        
        // 验证密码
        if (user.password !== password) {
            alert('密码错误');
            return;
        }
        
        // 登录成功
        this.currentUser = user;
        this.saveCurrentUser();
        this.showApp();
    }
    
    // 处理用户登出
    handleLogout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.showAuthPage();
        // 重置日程管理器
        if (window.scheduleManager) {
            window.scheduleManager = null;
        }
    }
    
    // 显示认证页面
    showAuthPage() {
        this.authPage.style.display = 'flex';
        this.appMain.style.display = 'none';
    }
    
    // 显示主应用
    showApp() {
        this.authPage.style.display = 'none';
        this.appMain.style.display = 'block';
        this.updateUserInfo();
        // 初始化日程管理器
        if (!window.scheduleManager) {
            window.scheduleManager = new ScheduleManager(this.currentUser);
        } else {
            window.scheduleManager.currentUser = this.currentUser;
            window.scheduleManager.init();
        }
    }
    
    // 更新用户信息显示
    updateUserInfo() {
        if (this.currentUser) {
            this.currentUsernameElement.textContent = this.currentUser.username;
            this.currentUserPhoneElement.style.display = 'none';
        }
    }
    
    // 显示修改用户名模态框
    showEditUsernameModal() {
        this.newUsernameInput.value = this.currentUser.username;
        this.editUsernameModal.classList.add('show');
    }
    
    // 隐藏修改用户名模态框
    hideEditUsernameModal() {
        this.editUsernameModal.classList.remove('show');
        this.editUsernameForm.reset();
    }
    
    // 更新用户名
    updateUsername() {
        const newUsername = this.newUsernameInput.value.trim();
        
        if (!this.validateUsername(newUsername)) {
            alert('用户名长度必须在2-12位之间');
            return;
        }
        
        // 更新用户信息
        this.currentUser.username = newUsername;
        this.users[this.currentUser.phone] = this.currentUser;
        this.saveUsers();
        this.updateUserInfo();
        this.hideEditUsernameModal();
        alert('用户名修改成功！');
    }
    
    // 检查登录状态
    checkLoginStatus() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            const userData = JSON.parse(savedUser);
            this.currentUser = this.users[userData.phone];
            if (this.currentUser) {
                this.showApp();
            } else {
                // 用户数据可能已被删除，清除本地存储
                localStorage.removeItem('currentUser');
                this.showAuthPage();
            }
        } else {
            this.showAuthPage();
        }
    }
    
    // 保存当前用户到本地存储
    saveCurrentUser() {
        localStorage.setItem('currentUser', JSON.stringify({ phone: this.currentUser.phone }));
    }
    
    // 加载用户数据
    loadUsers() {
        const savedUsers = localStorage.getItem('users');
        return savedUsers ? JSON.parse(savedUsers) : {};
    }
    
    // 保存用户数据
    saveUsers() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }
}

// 日程管理类
class ScheduleManager {
    constructor(currentUser) {
        this.currentUser = currentUser;
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.motivationQuotes = this.getMotivationQuotes();
        this.init();
    }
    
    // 初始化日程管理器
    init() {
        this.events = this.loadEvents();
        this.tags = this.loadTags();
        this.initElements();
        this.bindEvents();
        this.initPage();
    }
    
    // 初始化DOM元素
    initElements() {
        // 日历相关
        this.currentMonthElement = document.getElementById('currentMonth');
        this.calendarDaysElement = document.getElementById('calendarDays');
        this.prevMonthButton = document.getElementById('prevMonth');
        this.nextMonthButton = document.getElementById('nextMonth');
        
        // 事件表单相关
        this.eventForm = document.getElementById('eventForm');
        this.eventNameInput = document.getElementById('eventName');
        this.eventTagSelect = document.getElementById('eventTag');
        this.startTimeInput = document.getElementById('startTime');
        this.endTimeInput = document.getElementById('endTime');
        // 添加事项表单的自定义标签相关
        this.addNewTagNameInput = document.getElementById('addNewTagName');
        this.addNewTagBtn = document.getElementById('addNewTagBtn');
        
        // 事件列表相关
        this.eventsContainer = document.getElementById('eventsContainer');
        this.selectedDateTitle = document.getElementById('selectedDateTitle');
        
        // 编辑模态框相关
        this.editEventModal = document.getElementById('editEventModal');
        this.closeEditModalBtn = document.getElementById('closeEditModal');
        this.cancelEditBtn = document.getElementById('cancelEdit');
        this.editEventForm = document.getElementById('editEventForm');
        this.editEventIdInput = document.getElementById('editEventId');
        this.editEventNameInput = document.getElementById('editEventName');
        this.editEventTagSelect = document.getElementById('editEventTag');
        this.editStartTimeInput = document.getElementById('editStartTime');
        this.editEndTimeInput = document.getElementById('editEndTime');
        
        // 自定义标签相关事件
        this.newTagNameInput = document.getElementById('newTagName');
        this.addCustomTagBtn = document.getElementById('addCustomTag');
        
        // 其他功能相关
        this.exportBtn = document.getElementById('exportBtn');
        this.dashboardBtn = document.getElementById('dashboardBtn');
        this.dashboardModal = document.getElementById('dashboardModal');
        this.closeDashboardBtn = document.getElementById('closeDashboard');
        this.motivationText = document.getElementById('motivationText');
    }
    
    // 绑定事件监听
    bindEvents() {
        // 日历导航
        this.prevMonthButton.addEventListener('click', () => this.changeMonth(-1));
        this.nextMonthButton.addEventListener('click', () => this.changeMonth(1));
        
        // 事件表单提交
        this.eventForm.addEventListener('submit', (e) => this.handleEventSubmit(e));
        
        // 添加事项表单的自定义标签事件
        this.addNewTagBtn.addEventListener('click', () => this.addNewTag());
        
        // 编辑模态框相关事件
        this.closeEditModalBtn.addEventListener('click', () => this.closeEditModal());
        this.cancelEditBtn.addEventListener('click', () => this.closeEditModal());
        this.editEventForm.addEventListener('submit', (e) => this.handleEditEventSubmit(e));
        window.addEventListener('click', (e) => {
            if (e.target === this.editEventModal) {
                this.closeEditModal();
            }
        });
        
        // 自定义标签相关事件
        this.addCustomTagBtn.addEventListener('click', () => this.addCustomTag());
        
        // 导出功能
        this.exportBtn.addEventListener('click', () => this.exportEvents());
        
        // 仪表盘功能
        this.dashboardBtn.addEventListener('click', () => this.openDashboard());
        this.closeDashboardBtn.addEventListener('click', () => this.closeDashboard());
        window.addEventListener('click', (e) => {
            if (e.target === this.dashboardModal) {
                this.closeDashboard();
            }
        });
    }
    
    // 初始化页面
    initPage() {
        this.updateTagSelectors();
        this.generateCalendar();
        this.updateSelectedDateTitle();
        this.displayEvents();
        this.updateMotivationText();
    }
    
    // 获取每日鼓励语列表
    getMotivationQuotes() {
        return [
            "今天也是充满活力的一天，加油！",
            "每一个小目标的完成，都是向成功迈进的一大步！",
            "保持积极心态，一切皆有可能！",
            "相信自己，你比想象中更强大！",
            "今天的努力，明天的收获！",
            "专注当下，未来可期！",
            "行动是成功的开始，等待是失败的源头！",
            "每一天都是新的开始，新的机会！",
            "努力到无能为力，拼搏到感动自己！",
            "成功属于坚持不懈的人！",
            "不为失败找借口，只为成功找方法！",
            "你的潜力，远超出你的想象！",
            "今天的付出，是为了明天更好的自己！",
            "保持热情，拥抱每一天！",
            "每一次挑战，都是成长的机会！"
        ];
    }
    
    // 更新每日鼓励语
    updateMotivationText() {
        const randomIndex = Math.floor(Math.random() * this.motivationQuotes.length);
        this.motivationText.textContent = this.motivationQuotes[randomIndex];
    }
    
    // 生成日历
    generateCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // 更新月份标题
        const monthNames = ["一月", "二月", "三月", "四月", "五月", "六月",
                           "七月", "八月", "九月", "十月", "十一月", "十二月"];
        this.currentMonthElement.textContent = `${year}年${monthNames[month]}`;
        
        // 清空日历
        this.calendarDaysElement.innerHTML = '';
        
        // 获取月份第一天和最后一天
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay() + (firstDay.getDay() === 0 ? -6 : 1));
        
        // 生成42天的日历（6行7列）
        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'day';
            dayElement.textContent = date.getDate();
            dayElement.dataset.date = date.toISOString().split('T')[0];
            
            // 判断是否为当前月份
            if (date.getMonth() !== month) {
                dayElement.classList.add('other-month');
            }
            
            // 判断是否为今天
            const today = new Date();
            if (date.toDateString() === today.toDateString()) {
                dayElement.classList.add('current-day');
            }
            
            // 判断是否为选中日期
            if (date.toDateString() === this.selectedDate.toDateString()) {
                dayElement.classList.add('selected');
            }
            
            // 判断是否有事件
            if (this.hasEvents(date)) {
                dayElement.classList.add('has-events');
            }
            
            // 添加点击事件
            dayElement.addEventListener('click', () => {
                if (!dayElement.classList.contains('other-month')) {
                    this.selectedDate = new Date(date);
                    this.generateCalendar();
                    this.updateSelectedDateTitle();
                    this.displayEvents();
                }
            });
            
            this.calendarDaysElement.appendChild(dayElement);
        }
    }
    
    // 切换月份
    changeMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.generateCalendar();
    }
    
    // 更新选中日期标题
    updateSelectedDateTitle() {
        const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
        this.selectedDateTitle.textContent = this.selectedDate.toLocaleDateString('zh-CN', options);
    }
    
    // 检查日期是否有事件
    hasEvents(date) {
        const dateStr = date.toISOString().split('T')[0];
        return this.events.some(event => event.date === dateStr);
    }
    
    // 处理事件提交
    handleEventSubmit(e) {
        e.preventDefault();
        
        // 获取表单数据
        const event = {
            id: Date.now().toString(),
            userId: this.currentUser.phone,
            date: this.selectedDate.toISOString().split('T')[0],
            name: this.eventNameInput.value,
            tag: this.eventTagSelect.value,
            startTime: this.startTimeInput.value,
            endTime: this.endTimeInput.value
        };
        
        // 添加事件
        this.events.push(event);
        
        // 保存事件
        this.saveEvents();
        
        // 更新页面
        this.generateCalendar();
        this.displayEvents();
        
        // 重置表单
        this.eventForm.reset();
        // 确保标签选择器重置为第一个选项
        if (this.eventTagSelect.options.length > 0) {
            this.eventTagSelect.selectedIndex = 0;
        }
    }
    
    // 显示当天事件
    displayEvents() {
        const dateStr = this.selectedDate.toISOString().split('T')[0];
        const dayEvents = this.events
            .filter(event => event.date === dateStr)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
        
        if (dayEvents.length === 0) {
            this.eventsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-check"></i>
                    <p>今天还没有安排任何事项</p>
                </div>
            `;
            return;
        }
        
        this.eventsContainer.innerHTML = dayEvents.map(event => `
            <div class="event-item ${event.tag}" data-tag="${event.tag}">
                <div class="event-info">
                    <div class="event-title">${event.name}</div>
                    <div class="event-time">${event.startTime} - ${event.endTime}</div>
                    <span class="event-tag ${event.tag}">${event.tag}</span>
                </div>
                <div class="event-actions">
                    <button class="btn btn-secondary" onclick="scheduleManager.openEditModal('${event.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger" onclick="scheduleManager.deleteEvent('${event.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    // 打开编辑模态框
    openEditModal(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (event) {
            this.editEventIdInput.value = event.id;
            this.editEventNameInput.value = event.name;
            this.editEventTagSelect.value = event.tag;
            this.editStartTimeInput.value = event.startTime;
            this.editEndTimeInput.value = event.endTime;
            this.editEventModal.classList.add('show');
        }
    }
    
    // 关闭编辑模态框
    closeEditModal() {
        this.editEventModal.classList.remove('show');
        this.editEventForm.reset();
    }
    
    // 处理编辑事件提交
    handleEditEventSubmit(e) {
        e.preventDefault();
        
        const eventId = this.editEventIdInput.value;
        const eventIndex = this.events.findIndex(e => e.id === eventId);
        
        if (eventIndex !== -1) {
            // 更新事件
            this.events[eventIndex] = {
                ...this.events[eventIndex],
                name: this.editEventNameInput.value,
                tag: this.editEventTagSelect.value,
                startTime: this.editStartTimeInput.value,
                endTime: this.editEndTimeInput.value
            };
            
            // 保存事件
            this.saveEvents();
            
            // 更新页面
            this.generateCalendar();
            this.displayEvents();
            
            // 关闭模态框
            this.closeEditModal();
        }
    }
    
    // 删除事件
    deleteEvent(eventId) {
        if (confirm('确定要删除这个事项吗？')) {
            this.events = this.events.filter(event => event.id !== eventId);
            this.saveEvents();
            this.generateCalendar();
            this.displayEvents();
        }
    }
    
    // 导出事件为XLS格式
    exportEvents() {
        // 准备导出数据
        const exportData = this.events.map(event => {
            return {
                '日期': event.date,
                '事项名称': event.name,
                '标签': event.tag,
                '开始时间': event.startTime,
                '结束时间': event.endTime
            };
        });
        
        // 创建工作簿和工作表
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(exportData);
        
        // 调整列宽
        const colWidths = [
            { wch: 15 }, // 日期
            { wch: 30 }, // 事项名称
            { wch: 10 }, // 标签
            { wch: 12 }, // 开始时间
            { wch: 12 }  // 结束时间
        ];
        ws['!cols'] = colWidths;
        
        // 添加工作表到工作簿
        XLSX.utils.book_append_sheet(wb, ws, '日程表');
        
        // 生成并下载XLS文件
        const fileName = `schedule-${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
    }
    
    // 打开仪表盘
    openDashboard() {
        this.updateDashboardStats();
        this.dashboardModal.classList.add('show');
    }
    
    // 关闭仪表盘
    closeDashboard() {
        this.dashboardModal.classList.remove('show');
    }
    
    // 更新仪表盘统计数据
    updateDashboardStats() {
        const stats = this.calculateStats();
        
        // 更新统计卡片
        document.getElementById('totalEvents').textContent = stats.total;
        document.getElementById('weekEvents').textContent = stats.week;
        document.getElementById('monthEvents').textContent = stats.month;
        document.getElementById('avgEvents').textContent = stats.avgPerDay.toFixed(1);
        document.getElementById('totalHours').textContent = stats.totalHours.toFixed(1);
        document.getElementById('avgHoursPerDay').textContent = stats.avgHoursPerDay.toFixed(1);
        
        // 更新标签分布
        this.updateTagDistribution(stats.tagDistribution);
        
        // 更新时间分布
        this.updateTimeDistribution(stats.timeDistribution);
    }
    
    // 计算统计数据
    calculateStats() {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        
        // 计算总事件数
        const total = this.events.length;
        
        // 计算本周事件数
        const week = this.events.filter(event => event.date >= weekAgo && event.date <= today).length;
        
        // 计算本月事件数
        const month = this.events.filter(event => event.date >= monthStart && event.date <= today).length;
        
        // 计算平均每天事件数
        const daysWithEvents = new Set(this.events.map(event => event.date)).size;
        const avgPerDay = daysWithEvents > 0 ? total / daysWithEvents : 0;
        
        // 计算总时长（小时）
        const totalHours = this.calculateTotalHours();
        
        // 计算平均每天时长（小时）
        const avgHoursPerDay = daysWithEvents > 0 ? totalHours / daysWithEvents : 0;
        
        // 计算标签分布
        const tagDistribution = this.events.reduce((acc, event) => {
            acc[event.tag] = (acc[event.tag] || 0) + 1;
            return acc;
        }, {});
        
        // 计算标签时间分布
        const timeDistribution = this.calculateTimeDistributionData();
        
        return { total, week, month, avgPerDay, totalHours, avgHoursPerDay, tagDistribution, timeDistribution };
    }
    
    // 计算总时长（小时）
    calculateTotalHours() {
        return this.events.reduce((total, event) => {
            const [startHour, startMinute] = event.startTime.split(':').map(Number);
            const [endHour, endMinute] = event.endTime.split(':').map(Number);
            
            const startTotalMinutes = startHour * 60 + startMinute;
            const endTotalMinutes = endHour * 60 + endMinute;
            const durationMinutes = endTotalMinutes - startTotalMinutes;
            
            return total + (durationMinutes / 60);
        }, 0);
    }
    
    // 计算标签时间分布
    calculateTimeDistributionData() {
        return this.events.reduce((acc, event) => {
            const [startHour, startMinute] = event.startTime.split(':').map(Number);
            const [endHour, endMinute] = event.endTime.split(':').map(Number);
            
            const startTotalMinutes = startHour * 60 + startMinute;
            const endTotalMinutes = endHour * 60 + endMinute;
            const durationHours = (endTotalMinutes - startTotalMinutes) / 60;
            
            acc[event.tag] = (acc[event.tag] || 0) + durationHours;
            return acc;
        }, {});
    }
    
    // 更新标签分布
    updateTagDistribution(tagDistribution) {
        const container = document.getElementById('tagDistribution');
        const total = Object.values(tagDistribution).reduce((sum, count) => sum + count, 0);
        
        container.innerHTML = Object.entries(tagDistribution)
            .sort(([,a], [,b]) => b - a)
            .map(([tag, count]) => {
                const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                return `
                    <div class="tag-bar">
                        <div class="tag-label">${tag}</div>
                        <div class="tag-progress">
                            <div class="tag-progress-fill" style="width: ${percentage}%; background-color: ${this.getTagColor(tag)};"></div>
                        </div>
                        <div class="tag-count">${count}</div>
                    </div>
                `;
            })
            .join('');
    }
    
    // 更新时间分布
    updateTimeDistribution(timeDistribution) {
        const container = document.getElementById('timeDistribution');
        const total = Object.values(timeDistribution).reduce((sum, hours) => sum + hours, 0);
        
        container.innerHTML = Object.entries(timeDistribution)
            .sort(([,a], [,b]) => b - a)
            .map(([tag, hours]) => {
                const percentage = total > 0 ? Math.round((hours / total) * 100) : 0;
                return `
                    <div class="tag-bar">
                        <div class="tag-label">${tag}</div>
                        <div class="tag-progress">
                            <div class="tag-progress-fill" style="width: ${percentage}%; background-color: ${this.getTagColor(tag)};"></div>
                        </div>
                        <div class="tag-count">${hours.toFixed(1)}h</div>
                    </div>
                `;
            })
            .join('');
    }
    
    // 加载事件
    loadEvents() {
        const allEvents = JSON.parse(localStorage.getItem('scheduleEvents') || '[]');
        // 只返回当前用户的事件
        return allEvents.filter(event => event.userId === this.currentUser.phone);
    }
    
    // 保存事件
    saveEvents() {
        // 获取所有事件
        const allEvents = JSON.parse(localStorage.getItem('scheduleEvents') || '[]');
        // 过滤掉当前用户的旧事件
        const otherEvents = allEvents.filter(event => event.userId !== this.currentUser.phone);
        // 合并当前用户的新事件和其他用户的事件
        const updatedEvents = [...otherEvents, ...this.events];
        // 保存所有事件
        localStorage.setItem('scheduleEvents', JSON.stringify(updatedEvents));
    }
    
    // 加载标签（用户特定）
    loadTags() {
        const allTags = JSON.parse(localStorage.getItem('scheduleTags') || '{}');
        return allTags[this.currentUser.phone] || ['工作', '学习', '生活', '健身', '其他'];
    }
    
    // 保存标签（用户特定）
    saveTags() {
        const allTags = JSON.parse(localStorage.getItem('scheduleTags') || '{}');
        allTags[this.currentUser.phone] = this.tags;
        localStorage.setItem('scheduleTags', JSON.stringify(allTags));
    }
    
    // 更新标签选择器
    updateTagSelectors() {
        // 更新添加事件表单的标签选择器
        this.updateTagSelector(this.eventTagSelect);
        // 更新编辑事件表单的标签选择器
        this.updateTagSelector(this.editEventTagSelect);
    }
    
    // 更新单个标签选择器
    updateTagSelector(selectElement) {
        const currentValue = selectElement.value;
        selectElement.innerHTML = this.tags.map(tag => 
            `<option value="${tag}" ${tag === currentValue ? 'selected' : ''}>${tag}</option>`
        ).join('');
    }
    
    // 添加自定义标签（在添加事项表单中）
    addNewTag() {
        const tagName = this.addNewTagNameInput.value.trim();
        if (tagName && !this.tags.includes(tagName)) {
            this.tags.push(tagName);
            this.saveTags();
            this.updateTagSelectors();
            this.addNewTagNameInput.value = '';
        }
    }
    
    // 添加自定义标签（在编辑事项表单中）
    addCustomTag() {
        const tagName = this.newTagNameInput.value.trim();
        if (tagName && !this.tags.includes(tagName)) {
            this.tags.push(tagName);
            this.saveTags();
            this.updateTagSelectors();
            this.newTagNameInput.value = '';
        }
    }
    
    // 获取标签颜色
    getTagColor(tag) {
        const colors = {
            '工作': '#667eea',
            '学习': '#4CAF50',
            '生活': '#f57c00',
            '健身': '#d32f2f',
            '其他': '#9e9e9e'
        };
        return colors[tag] || '#9e9e9e';
    }
}

// 初始化应用
let authManager;
window.addEventListener('DOMContentLoaded', () => {
    authManager = new AuthManager();
});
