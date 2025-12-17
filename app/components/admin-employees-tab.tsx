"use client";

import React from "react";
import { Button } from "@/app/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Switch } from "@/app/components/ui/switch";
import {
    Table,
    TableBody,
    TableCaption,
    TableHead,
    TableHeader,
    TableRow,
    TableCell,
} from "@/app/components/ui/table";
import { Employee } from "@/lib/types";
import { sortData } from "@/lib/utils";

export default function AdminEmployeesTab() {
    const [employees, setEmployees] = React.useState<Employee[]>([]);
    const [empDialogOpen, setEmpDialogOpen] = React.useState(false);
    const [selectedEmployee, setSelectedEmployee] =
        React.useState<Employee | null>(null);
    const [empLoading, setEmpLoading] = React.useState(false);
    const [empError, setEmpError] = React.useState<string | null>(null);
    const [sortColumn, setSortColumn] = React.useState<keyof Employee | null>(
        null
    );
    const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">(
        "asc"
    );

    async function fetchEmployees() {
        try {
            setEmpLoading(true);
            setEmpError(null);

            const res = await fetch("/api/employee");
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Failed to fetch employees");
            }

            const data = await res.json();
            setEmployees(data ?? []);
        } catch (err: unknown) {
            setEmpError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setEmpLoading(false);
        }
    }

    React.useEffect(() => {
        void fetchEmployees();
    }, []);

    function openNewEmployeeDialog() {
        setSelectedEmployee({
            name: "",
            salary: 0,
            hours: 0,
            password: "",
            isEmployed: true,
            roleId: 1,
        });
        setEmpError(null);
        setEmpDialogOpen(true);
    }

    function openEditEmployeeDialog(emp: Employee) {
        setSelectedEmployee({ ...emp });
        setEmpError(null);
        setEmpDialogOpen(true);
    }

    function updateSelected<K extends keyof Employee>(
        key: K,
        value: Employee[K]
    ) {
        setSelectedEmployee((prev) =>
            prev ? { ...prev, [key]: value } : prev
        );
    }

    async function saveEmployee() {
        if (!selectedEmployee) return;

        try {
            setEmpLoading(true);
            setEmpError(null);

            const { id, ...payload } = selectedEmployee;
            const isNew = id === undefined || id === null;

            const res = await fetch(
                isNew ? "/api/employee" : `/api/employee/${id}`,
                {
                    method: isNew ? "POST" : "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Failed to save employee");
            }

            await fetchEmployees();
            setEmpDialogOpen(false);
        } catch (err: unknown) {
            setEmpError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setEmpLoading(false);
        }
    }

    async function deleteEmployee() {
        if (!selectedEmployee || selectedEmployee.id == null) return;
        if (!confirm(`Delete employee "${selectedEmployee.name}"?`)) return;

        try {
            setEmpLoading(true);
            setEmpError(null);

            const res = await fetch(`/api/employee/${selectedEmployee.id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Failed to delete employee");
            }

            await fetchEmployees();
            setEmpDialogOpen(false);
        } catch (err: unknown) {
            setEmpError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setEmpLoading(false);
        }
    }

    function handleSort(column: keyof Employee) {
        if (sortColumn === column) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(column);
            setSortDirection("asc");
        }
    }

    const sortedEmployees = sortColumn
        ? sortData(employees, sortColumn, sortDirection)
        : employees;

    return (
        <div className="mt-6 space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Employees</h2>
                <Button
                    onClick={openNewEmployeeDialog}
                    className="bg-primary hover:bg-primary/90"
                >
                    Add Employee
                </Button>
            </div>

            {empLoading && employees.length === 0 && (
                <p className="text-sm text-muted-foreground">
                    Loading employees…
                </p>
            )}

            {empError && <p className="text-sm text-red-500">{empError}</p>}

            <Table aria-label="Employees table">
                <TableCaption className="sr-only">
                    Manage Employees
                </TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>
                            <button
                                onClick={() => handleSort("name")}
                                className="flex items-center gap-1 hover:text-primary cursor-pointer"
                            >
                                Name
                                {sortColumn === "name" && (
                                    <span>
                                        {sortDirection === "asc" ? "↑" : "↓"}
                                    </span>
                                )}
                            </button>
                        </TableHead>
                        <TableHead>
                            <button
                                onClick={() => handleSort("salary")}
                                className="flex items-center gap-1 hover:text-primary cursor-pointer"
                            >
                                Salary
                                {sortColumn === "salary" && (
                                    <span>
                                        {sortDirection === "asc" ? "↑" : "↓"}
                                    </span>
                                )}
                            </button>
                        </TableHead>
                        <TableHead>
                            <button
                                onClick={() => handleSort("hours")}
                                className="flex items-center gap-1 hover:text-primary cursor-pointer"
                            >
                                Hours
                                {sortColumn === "hours" && (
                                    <span>
                                        {sortDirection === "asc" ? "↑" : "↓"}
                                    </span>
                                )}
                            </button>
                        </TableHead>
                        <TableHead>
                            <button
                                onClick={() => handleSort("isEmployed")}
                                className="flex items-center gap-1 hover:text-primary cursor-pointer"
                            >
                                Employed
                                {sortColumn === "isEmployed" && (
                                    <span>
                                        {sortDirection === "asc" ? "↑" : "↓"}
                                    </span>
                                )}
                            </button>
                        </TableHead>
                        <TableHead>
                            <button
                                onClick={() => handleSort("roleId")}
                                className="flex items-center gap-1 hover:text-primary cursor-pointer"
                            >
                                Role ID
                                {sortColumn === "roleId" && (
                                    <span>
                                        {sortDirection === "asc" ? "↑" : "↓"}
                                    </span>
                                )}
                            </button>
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedEmployees.length === 0 && !empLoading && (
                        <TableRow>
                            <TableCell
                                colSpan={6}
                                className="text-center text-sm"
                            >
                                No employees found.
                            </TableCell>
                        </TableRow>
                    )}

                    {sortedEmployees.map((emp) => (
                        <TableRow key={emp.id}>
                            <TableCell>{emp.name}</TableCell>
                            <TableCell>{emp.salary}</TableCell>
                            <TableCell>{emp.hours}</TableCell>
                            <TableCell>
                                {emp.isEmployed ? "Yes" : "No"}
                            </TableCell>
                            <TableCell>{emp.roleId ?? "-"}</TableCell>
                            <TableCell className="text-right">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openEditEmployeeDialog(emp)}
                                >
                                    Edit
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Dialog open={empDialogOpen} onOpenChange={setEmpDialogOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedEmployee?.id
                                ? `Edit Employee #${selectedEmployee.id}`
                                : "Add Employee"}
                        </DialogTitle>
                        <DialogDescription>
                            Update employee details such as salary, hours, and
                            employment status.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedEmployee && (
                        <div className="space-y-4 mt-4">
                            {empError && (
                                <p className="text-sm text-red-500">
                                    {empError}
                                </p>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label htmlFor="emp-name">Name</Label>
                                    <Input
                                        id="emp-name"
                                        value={selectedEmployee.name}
                                        onChange={(e) =>
                                            updateSelected(
                                                "name",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="emp-salary">Salary</Label>
                                    <Input
                                        id="emp-salary"
                                        type="number"
                                        value={
                                            selectedEmployee.salary === 0
                                                ? ""
                                                : selectedEmployee.salary
                                        }
                                        onChange={(e) =>
                                            updateSelected(
                                                "salary",
                                                e.target.value === ""
                                                    ? 0
                                                    : Number(e.target.value) ||
                                                          0
                                            )
                                        }
                                        placeholder="0"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="emp-hours">Hours</Label>
                                    <Input
                                        id="emp-hours"
                                        type="number"
                                        value={
                                            selectedEmployee.hours === 0
                                                ? ""
                                                : selectedEmployee.hours
                                        }
                                        onChange={(e) =>
                                            updateSelected(
                                                "hours",
                                                e.target.value === ""
                                                    ? 0
                                                    : Number(e.target.value) ||
                                                          0
                                            )
                                        }
                                        placeholder="0"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="emp-roleId">Role ID</Label>
                                    <Input
                                        id="emp-roleId"
                                        type="number"
                                        value={
                                            selectedEmployee.roleId === 0
                                                ? ""
                                                : selectedEmployee.roleId ?? ""
                                        }
                                        onChange={(e) =>
                                            updateSelected(
                                                "roleId",
                                                e.target.value === ""
                                                    ? 1
                                                    : Number(e.target.value) ||
                                                          1
                                            )
                                        }
                                        placeholder="1"
                                    />
                                </div>

                                <div className="space-y-1 md:col-span-2">
                                    <Label htmlFor="emp-password">
                                        Password (for demo only)
                                    </Label>
                                    <Input
                                        id="emp-password"
                                        type="text"
                                        value={selectedEmployee.password}
                                        onChange={(e) =>
                                            updateSelected(
                                                "password",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>

                                <div className="flex items-center space-x-2 md:col-span-2">
                                    <Switch
                                        id="emp-employed"
                                        checked={selectedEmployee.isEmployed}
                                        onCheckedChange={(checked) =>
                                            updateSelected(
                                                "isEmployed",
                                                checked
                                            )
                                        }
                                    />
                                    <Label htmlFor="emp-employed">
                                        Currently employed
                                    </Label>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-4">
                                {selectedEmployee.id && (
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={deleteEmployee}
                                        disabled={empLoading}
                                    >
                                        Delete
                                    </Button>
                                )}

                                <div className="ml-auto flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setEmpDialogOpen(false)}
                                        disabled={empLoading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="button"
                                        className="bg-primary hover:bg-primary/90"
                                        onClick={saveEmployee}
                                        disabled={empLoading}
                                    >
                                        {empLoading ? "Saving..." : "Save"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
