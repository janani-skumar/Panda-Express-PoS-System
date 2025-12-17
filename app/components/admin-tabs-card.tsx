"use client";

import React from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/app/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/app/components/ui/tabs";
import { Separator } from "@/app/components/ui/separator";
import AdminReportsTab from "@/app/components/admin-reports-tab";
import AdminEmployeesTab from "@/app/components/admin-employees-tab";
import AdminInventoryTab from "@/app/components/admin-inventory-tab";
import AdminRecipesTab from "@/app/components/admin-recipes-tab";

export default function AdminTabsCard() {
    return (
        <Card className="w-full rounded-lg shadow-md border-border">
            <CardHeader className="pb-3">
                <CardTitle className="text-2xl font-semibold">
                    Dashboard
                </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
                <Tabs defaultValue="reports" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-secondary/50">
                        <TabsTrigger value="reports">Reports</TabsTrigger>
                        <TabsTrigger value="employees">
                            Manage Employees
                        </TabsTrigger>
                        <TabsTrigger value="inventory">
                            Buy Inventory
                        </TabsTrigger>
                        <TabsTrigger value="recipes">
                            Create Recipes
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="reports">
                        <AdminReportsTab />
                    </TabsContent>

                    <TabsContent value="employees">
                        <AdminEmployeesTab />
                    </TabsContent>

                    <TabsContent value="inventory">
                        <AdminInventoryTab />
                    </TabsContent>

                    <TabsContent value="recipes">
                        <AdminRecipesTab />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
