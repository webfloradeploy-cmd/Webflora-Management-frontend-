// Backend API Response Types
export interface ApiResponse<T = any> {
    message?: string;
    data?: T;
    error?: string;
}

// Admin Types
export interface AdminLoginRequest {
    email: string;
    password: string;
}

export interface AdminRegisterRequest {
    name: string;
    email: string;
    password: string;
    role: 'admin';
}

export interface AdminResponse {
    id: string;
    name: string;
    email: string;
    role: string;
}

export interface LoginResponse {
    message: string;
    token: string;
    user?: AuthUser;
    admin?: AdminResponse;
    employee?: EmployeeResponse;
    intern?: InternResponse;
}

export type AuthUser = AdminResponse | EmployeeResponse | InternResponse;

// Employee Types (Backend)
export interface EmployeeBackend {
    _id: string;
    name: string;
    email: string;
    role: string;
    phone: string;
    address: string;
    salary: number;
    employeeId?: string;
    status?: 'active' | 'inactive';
    jobRole?: string;
    department?: string;
    joiningDate?: string;
    fatherName?: string;
    motherName?: string;
    dob?: string;
    gender?: string;
    bloodGroup?: string;
    emergencyPhone?: string;
    aadhaarNumber?: string;
    panNumber?: string;
    bio?: string;
    qualification?: string;
    stream?: string;
    institution?: string;
    passingYear?: string;
    gradePercentage?: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    totalPaid?: number;
    createdAt: string;
    updatedAt: string;
}

export interface EmployeeResponse {
    id: string;
    name: string;
    email: string;
    role: string;
    status?: 'active' | 'inactive';
    jobRole?: string;
    department?: string;
}

export interface CreateEmployeeRequest {
    name: string;
    email: string;
    password: string;
    role: string;
    phone: string;
    address: string;
    salary: number;
    status?: 'active' | 'inactive';
    jobRole?: string;
    department?: string;
    joiningDate?: string;
    fatherName?: string;
    motherName?: string;
    dob?: string;
    gender?: string;
    bloodGroup?: string;
    emergencyPhone?: string;
    aadhaarNumber?: string;
    panNumber?: string;
    bio?: string;
    qualification?: string;
    stream?: string;
    institution?: string;
    passingYear?: string;
    gradePercentage?: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
}

export interface UpdateEmployeeRequest {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
    phone?: string;
    address?: string;
    salary?: number;
    status?: 'active' | 'inactive';
    jobRole?: string;
    department?: string;
    joiningDate?: string;
    fatherName?: string;
    motherName?: string;
    dob?: string;
    gender?: string;
    bloodGroup?: string;
    emergencyPhone?: string;
    aadhaarNumber?: string;
    panNumber?: string;
    bio?: string;
    qualification?: string;
    stream?: string;
    institution?: string;
    passingYear?: string;
    gradePercentage?: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
}

// Intern Types (Backend)
export interface InternBackend {
    _id: string;
    name: string;
    email: string;
    password?: string;
    phone: string;
    address: string;
    role: string;
    salary: number;
    totalPaid?: number;
    duration: string;
    employeeId?: string;
    status?: 'active' | 'inactive';
    jobRole?: string;
    department?: string;
    joiningDate?: string;
    fatherName?: string;
    motherName?: string;
    dob?: string;
    gender?: string;
    bloodGroup?: string;
    emergencyPhone?: string;
    aadhaarNumber?: string;
    panNumber?: string;
    bio?: string;
    qualification?: string;
    stream?: string;
    institution?: string;
    passingYear?: string;
    gradePercentage?: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    createdAt: string;
    updatedAt: string;
}

export interface InternResponse {
    id: string;
    name: string;
    email: string;
    role: string;
    status?: 'active' | 'inactive';
    jobRole?: string;
    department?: string;
}

export interface CreateInternRequest {
    name: string;
    email: string;
    password: string;
    phone: string;
    address: string;
    duration: string;
    salary: number;
    status?: 'active' | 'inactive';
    jobRole?: string;
    department?: string;
    joiningDate?: string;
    fatherName?: string;
    motherName?: string;
    dob?: string;
    gender?: string;
    bloodGroup?: string;
    emergencyPhone?: string;
    aadhaarNumber?: string;
    panNumber?: string;
    bio?: string;
    qualification?: string;
    stream?: string;
    institution?: string;
    passingYear?: string;
    gradePercentage?: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
}

export interface UpdateInternRequest extends Partial<CreateInternRequest> { }

// Client Types (Backend)
export interface ClientBackend {
    _id: string;
    clientName: string;
    contactNumber: string;
    email: string;
    address: string;
    referenceNo: string;
    totalDue?: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateClientRequest {
    clientName: string;
    contactNumber: string;
    email: string;
    address: string;
    referenceNo: string;
}

export interface UpdateClientRequest {
    clientName?: string;
    contactNumber?: string;
    email?: string;
    address?: string;
    referenceNo?: string;
}

// Invoice Types (Backend)
export interface InvoiceBackend {
    _id: string;
    clientId: string | ClientBackend;
    projectId?: string | ProjectBackend; // Keep for backward compatibility/single project logic
    projectIds?: string[] | ProjectBackend[]; // New multi-project support
    referenceNo: string;
    invoiceNo: string;
    amount: number;
    description?: string;
    method: 'Cash' | 'UPI' | 'Bank Transfer' | 'Card' | 'Cheque';
    date: string;
    status: 'pending' | 'paid' | 'overdue';
    previousDue?: number;
    totalPaid?: number;
    dueAmount?: number;
    selectedDues?: string[];
    dueBreakdown?: Array<{ projectName: string; amount: number }>;
    projectTotal?: number;
    items?: Array<{ service: string; units: string; price: number }>;
    // Fields added by backend controllers
    projectName?: string;
    clientName?: string;
    grandTotal?: number;
}

export interface CreateInvoiceRequest {
    clientId: string;
    projectIds: string[];
    selectedDues?: string[];
    referenceNo: string;
    invoiceNo: string;
    amount: number;
    description?: string;
    method: 'Cash' | 'UPI' | 'Bank Transfer' | 'Card' | 'Cheque' | '';
    date?: string;
    status?: 'pending' | 'paid' | 'overdue';
    previousDue?: number;
    items?: Array<{ service: string; units: string; price: number }>;
}

export interface UpdateInvoiceRequest {
    clientId?: string;
    projectIds?: string[];
    selectedDues?: string[];
    referenceNo?: string;
    invoiceNo?: string;
    amount?: number;
    description?: string;
    method?: 'Cash' | 'UPI' | 'Bank Transfer' | 'Card' | 'Cheque';
    date?: string;
    status?: 'pending' | 'paid' | 'overdue';
    previousDue?: number;
    items?: Array<{ service: string; units: string; price: number }>;
}

// Project Types (Backend)
export interface ProjectBackend {
    _id: string;
    projectName: string;
    client: string | ClientBackend;
    description?: string;
    techStack?: string[];
    status: "New" | "In Progress" | "On Hold" | "Completed";
    assignedTeam?: string[] | EmployeeBackend[];
    startDate?: string;
    endDate?: string;
    totalAmount: number;
    totalPaid?: number;
    dueAmount?: number;
    invoices?: InvoiceBackend[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateProjectRequest {
    projectName: string;
    client: string;
    description?: string;
    techStack?: string[];
    status?: "New" | "In Progress" | "On Hold" | "Completed";
    assignedTeam?: string[];
    startDate?: string;
    endDate?: string;
    totalAmount: number;
}

// Handover Types
export interface HandoverBackend {
    _id: string;
    projectId: string | any;
    assigneeId: string | any;
    assigneeModel: "employee" | "intern";
    handoverDate: string;
    deadline?: string;
    credentials: {
        adminUrl?: string;
        adminUser?: string;
        adminPass?: string;
        dbUrl?: string;
        serverIp?: string;
        ftpHost?: string;
        ftpUser?: string;
        ftpPass?: string;
        githubUrl?: string;
    };
    instructions?: string;
    status: "In Progress" | "Handed Over" | "Completed" | "Revoked";
    createdAt: string;
    updatedAt: string;
}

export interface CreateHandoverRequest {
    projectId: string;
    assigneeId: string;
    assigneeModel: "employee" | "intern";
    handoverDate?: string;
    deadline?: string;
    credentials?: HandoverBackend["credentials"];
    instructions?: string;
    status?: HandoverBackend["status"];
}

export interface UpdateHandoverRequest extends Partial<CreateHandoverRequest> { }

// Salary Types
export interface SalaryBackend {
    _id: string;
    payeeId: string;
    payeeModel: 'employee' | 'intern';
    amount: number;
    paymentDate: string;
    month: string;
    year: number;
    remarks?: string;
    createdAt: string;
    updatedAt: string;
}

export interface SalaryRecord extends SalaryBackend {
    payeeName: string;
}

export interface CreateSalaryRequest {
    payeeId: string;
    payeeModel: 'employee' | 'intern';
    amount: number;
    month: string;
    year: number;
    remarks?: string;
    paymentDate?: string;
}

export interface SalaryStats {
    _id: {
        year: number;
        month: string;
        payeeModel: 'employee' | 'intern';
    };
    totalAmount: number;
    count: number;
}


// Expense Types
export interface ExpenseBackend {
    _id: string;
    date: string;
    amount: number;
    description: string;
    category: "Food" | "Travel" | "Office Supplies" | "Salary/Payment" | "Marketing" | "Others";
    type: "Self Spent" | "Sent to Employee" | "Sent to Intern" | "Company Expense";
    moneySource: "Own Money" | "Company Money";
    returnStatus: "Pending" | "Returned";
    returnDate?: string;
    recipientId?: string;
    recipientModel?: "employee" | "intern";
    recipientName?: string;
    receiptImage: string;
    recordedBy: string | any;
    status: "pending" | "approved" | "rejected";
    createdAt: string;
    updatedAt: string;
}

export interface CreateExpenseRequest {
    date: string;
    amount: number;
    description: string;
    category: string;
    type: string;
    moneySource: string;
    recipientId?: string;
    recipientModel?: string;
    receiptImage: string;
}

export const adaptExpenseData = (expense: ExpenseBackend): any => {
    return {
        id: expense._id,
        date: expense.date,
        amount: expense.amount,
        description: expense.description,
        category: expense.category,
        type: expense.type,
        moneySource: expense.moneySource,
        returnStatus: expense.returnStatus,
        recipientName: expense.recipientName || 'N/A',
        receiptImage: expense.receiptImage,
        status: expense.status,
        recordedBy: typeof expense.recordedBy === 'object' ? expense.recordedBy.name : 'Unknown',
    };
};

// Data Adapters - Convert backend data to frontend format
export const adaptEmployeeData = (employee: EmployeeBackend): any => {
    return {
        id: employee._id,
        employeeId: employee.employeeId || '',
        name: employee.name,
        email: employee.email,
        role: employee.role,
        jobRole: employee.jobRole || '',
        department: employee.department || '',
        salary: employee.salary,
        joinDate: employee.joiningDate || employee.createdAt,
        status: (employee as any).status || 'active',
        avatar: employee.name.split(' ').map(n => n[0]).join('').toUpperCase(),
        fatherName: employee.fatherName || '',
        motherName: employee.motherName || '',
        dob: employee.dob,
        gender: employee.gender || '',
        bloodGroup: employee.bloodGroup || '',
        emergencyPhone: employee.emergencyPhone || '',
        aadhaarNumber: employee.aadhaarNumber || '',
        panNumber: employee.panNumber || '',
        bio: employee.bio || '',
        qualification: employee.qualification || '',
        stream: employee.stream || '',
        institution: employee.institution || '',
        passingYear: employee.passingYear || '',
        gradePercentage: employee.gradePercentage || '',
        bankName: employee.bankName || '',
        accountNumber: employee.accountNumber || '',
        ifscCode: employee.ifscCode || '',
        projectsCompleted: 0, // Default value
        tasksCompleted: 0, // Default value
        attendance: 95, // Default value
        rating: 4.0, // Default value
        revenueGenerated: 0, // Default value
        phone: employee.phone,
        address: employee.address,
        totalPaid: employee.totalPaid || 0,
        type: 'employee' as const,
    };
};

export const adaptClientData = (client: ClientBackend): any => {
    return {
        id: client._id,
        name: client.clientName,
        company: client.clientName,
        email: client.email,
        phone: client.contactNumber,
        projects: 0, // Default value
        totalBilled: 0, // Default value
        status: 'active' as const,
        avatar: client.clientName.split(' ').map(n => n[0]).join('').toUpperCase(),
        joinDate: client.createdAt,
        address: client.address,
        referenceNo: client.referenceNo,
        totalDue: client.totalDue || 0,
    };
};

export const adaptInvoiceData = (invoice: InvoiceBackend): any => {
    const amount = Number(invoice.amount);

    // Extract client info if populated
    const client = typeof invoice.clientId === 'object' ? invoice.clientId : null;
    const projects = Array.isArray(invoice.projectIds) 
        ? invoice.projectIds.filter(p => typeof p === 'object') as ProjectBackend[]
        : [];
    const firstProject = typeof invoice.projectId === 'object' ? invoice.projectId : (projects[0] || null);

    // Calculate project name if not provided by backend
    let projectName = invoice.projectName;
    if (!projectName) {
        if (projects.length > 0) {
            projectName = projects.map(p => p.projectName).join(" & ");
        } else if (firstProject) {
            projectName = firstProject.projectName;
        } else {
            projectName = 'Unknown Project';
        }
    }

    const previousDue = Number(invoice.previousDue) || 0;
    const grandTotal = invoice.grandTotal !== undefined ? invoice.grandTotal : (amount + previousDue);

    // Calculate combined project dues & total amounts
    const allProjects = projects.length > 0 ? projects : (firstProject ? [firstProject] : []);
    const projectDue = allProjects.length > 0 
        ? allProjects.reduce((sum, p) => sum + (Number((p as any).dueAmount) || 0), 0)
        : (typeof (invoice as any).projectDue === 'number' ? (invoice as any).projectDue : 0);
    const projectTotal = allProjects.length > 0
        ? allProjects.reduce((sum, p) => sum + (Number((p as any).totalAmount) || 0), 0)
        : (typeof (invoice as any).projectTotal === 'number' ? (invoice as any).projectTotal : amount);

    return {
        id: invoice._id,
        number: invoice.invoiceNo,
        clientName: invoice.clientName || client?.clientName || 'Unknown Client',
        projectName: projectName,
        projectId: typeof invoice.projectId === 'string' ? invoice.projectId : firstProject?._id,
        company: invoice.clientName || client?.clientName || 'Unknown Company',
        amount: amount,
        total: amount,
        grandTotal: grandTotal,
        status: invoice.status || 'pending',
        date: invoice.date, // Added for UI compatibility
        issueDate: invoice.date,
        dueDate: invoice.date,
        services: invoice.description ? [invoice.description] : [],
        method: invoice.method,
        description: invoice.description,
        clientId: typeof invoice.clientId === 'string' ? invoice.clientId : (client as any)?._id,
        projectIds: Array.isArray(invoice.projectIds) 
            ? invoice.projectIds.map((p: any) => typeof p === 'string' ? p : p._id)
            : [typeof invoice.projectId === 'string' ? invoice.projectId : firstProject?._id],
        selectedDues: invoice.selectedDues || [],
        projectDue: projectDue,
        previousDue: previousDue,
        dueBreakdown: invoice.dueBreakdown || [],
        projectTotal: projectTotal,
        items: invoice.items || [],
    };
};

export const adaptProjectData = (project: ProjectBackend): any => {
    const client = typeof project.client === 'object' ? project.client : null;

    return {
        id: project._id,
        name: project.projectName,
        client: client?.clientName || 'Unknown Client',
        clientId: typeof project.client === 'string' ? project.client : (client as any)?._id,
        status: project.status,
        progress: project.status === "Completed" ? 100 :
            project.status === "In Progress" ? 50 : 0,
        budget: project.totalAmount,
        totalPaid: project.totalPaid || 0,
        dueAmount: Number(project.dueAmount) || 0,
        invoices: Array.isArray(project.invoices) ? project.invoices.map(adaptInvoiceData) : [],
        spent: project.totalPaid || 0,
        startDate: project.startDate, // Added for UI compatibility
        deadline: project.endDate || project.createdAt,
        team: Array.isArray(project.assignedTeam) ?
            project.assignedTeam.map((m: any) => typeof m === 'object' ? m.name : 'Unknown') : [],
        priority: 'medium' as const, // Placeholder
        tasks: { completed: 0, total: 0 }, // Placeholder
        description: project.description, // Added for edit form
    };
};

export const adaptInternData = (intern: InternBackend): any => {
    return {
        id: intern._id,
        employeeId: intern.employeeId || '',
        name: intern.name,
        email: intern.email,
        phone: intern.phone,
        address: intern.address,
        role: intern.role || 'intern',
        jobRole: intern.jobRole || '',
        department: intern.department || '',
        salary: intern.salary,
        totalPaid: intern.totalPaid || 0,
        duration: intern.duration || '',
        status: (intern as any).status || 'active',
        joinDate: intern.joiningDate || intern.createdAt,
        avatar: intern.name.split(' ').map(n => n[0]).join('').toUpperCase(),
        fatherName: intern.fatherName || '',
        motherName: intern.motherName || '',
        dob: intern.dob,
        gender: intern.gender || '',
        bloodGroup: intern.bloodGroup || '',
        emergencyPhone: intern.emergencyPhone || '',
        aadhaarNumber: intern.aadhaarNumber || '',
        panNumber: intern.panNumber || '',
        bio: intern.bio || '',
        qualification: intern.qualification || '',
        stream: intern.stream || '',
        institution: intern.institution || '',
        passingYear: intern.passingYear || '',
        gradePercentage: intern.gradePercentage || '',
        bankName: intern.bankName || '',
        accountNumber: intern.accountNumber || '',
        ifscCode: intern.ifscCode || '',
        createdAt: intern.createdAt,
        updatedAt: intern.updatedAt,
        type: 'intern' as const,
    };
};

export const adaptHandoverData = (handover: HandoverBackend): any => {
    const project = typeof handover.projectId === 'object' ? handover.projectId : null;
    const assignee = typeof handover.assigneeId === 'object' ? handover.assigneeId : null;

    return {
        id: handover._id,
        projectId: typeof handover.projectId === 'string' ? handover.projectId : project?._id,
        projectName: project?.projectName || 'Unknown Project',
        assigneeId: typeof handover.assigneeId === 'string' ? handover.assigneeId : assignee?._id,
        assigneeName: assignee?.name || 'Unknown',
        assigneeModel: handover.assigneeModel,
        handoverDate: handover.handoverDate,
        deadline: handover.deadline,
        credentials: handover.credentials || {},
        instructions: handover.instructions || '',
        status: project?.status || handover.status || 'In Progress',
    };
};
