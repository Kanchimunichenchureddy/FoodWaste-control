const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
    };
};

export const authService = {
    async signUp(email, password, metadata = {}) {
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, ...metadata }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Registration failed');
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    async signIn(email, password) {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Login failed');
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    async signOut() {
        localStorage.removeItem('token');
        return { error: null };
    },

    async getCurrentUser() {
        try {
            const token = localStorage.getItem('token');
            if (!token) return { user: null, error: null };

            const response = await fetch(`${API_URL}/auth/me`, {
                headers: getHeaders(),
            });
            const data = await response.json();
            if (!response.ok) {
                // If 401, token might be expired
                if (response.status === 401) localStorage.removeItem('token');
                throw new Error(data.message || 'Failed to fetch user');
            }
            return { user: data, error: null };
        } catch (error) {
            return { user: null, error };
        }
    },

    async updateProfile(profileData) {
        try {
            const response = await fetch(`${API_URL}/auth/me`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(profileData),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },
};

export const organizationService = {
    async getUserOrganizations(userId) {
        try {
            const { user } = await authService.getCurrentUser();
            if (user && user.organization_id) {
                const response = await fetch(`${API_URL}/organizations/${user.organization_id}`, {
                    headers: getHeaders(),
                });
                const orgData = await response.json();
                if (!response.ok) {
                    return { data: [], error: null };
                }
                return {
                    data: [{
                        organizations: { ...orgData, role: user.role },
                        role: user.role
                    }],
                    error: null
                };
            }
            return { data: [], error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    async createOrganization(orgData) {
        // Handled in register.
        return { data: null, error: "Implemented in registration" };
    },

    async updateOrganization(orgId, orgData) {
        try {
            const response = await fetch(`${API_URL}/organizations/${orgId}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(orgData),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    }
};

export const pantryService = {
    async getPantryItems(organizationId = null, userId = null) {
        try {
            const response = await fetch(`${API_URL}/pantry`, {
                headers: getHeaders(),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            // Frontend expects { data, error }
            return { data: data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    async addPantryItem(itemData) {
        try {
            const response = await fetch(`${API_URL}/pantry`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(itemData),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            // Frontend expects array result based on Supabase
            // Backend now returns object, wrap in array for generic frontend consumption if needed
            // But we'll keep it consistent with the updated Pantry.jsx logic
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    async updatePantryItem(itemId, itemData) {
        try {
            const response = await fetch(`${API_URL}/pantry/${itemId}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(itemData),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return { data: [data], error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    async deletePantryItem(itemId) {
        try {
            const response = await fetch(`${API_URL}/pantry/${itemId}`, {
                method: 'DELETE',
                headers: getHeaders(),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return { error: null };
        } catch (error) {
            return { error };
        }
    },

    async deletePantryItems(itemIds) {
        // Bulk delete not implemented in backend yet, loop or new endpoint
        // Implementing naive loop for compatibility
        try {
            await Promise.all(itemIds.map(id =>
                fetch(`${API_URL}/pantry/${id}`, {
                    method: 'DELETE',
                    headers: getHeaders(),
                })
            ));
            return { error: null };
        } catch (error) {
            return { error };
        }
    },

    async consumePantryItem(itemId) {
        return this.updatePantryItem(itemId, { status: 'consumed', quantity: 0 });
    }
};

export const wasteLogService = {
    async logWaste(wasteData) {
        try {
            const response = await fetch(`${API_URL}/waste`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(wasteData),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return { data: [data], error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    async getWasteLogs(organizationId, startDate = null, endDate = null) {
        try {
            const params = new URLSearchParams();
            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);

            const response = await fetch(`${API_URL}/waste?${params.toString()}`, {
                headers: getHeaders(),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    }
};

export const analyticsService = {
    async getOverview(organizationId) {
        try {
            const response = await fetch(`${API_URL}/analytics/overview`, {
                headers: getHeaders(),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },
    async getWasteByCategory(organizationId) {
        try {
            const response = await fetch(`${API_URL}/analytics/category`, {
                headers: getHeaders(),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },
    async getWasteByReason(organizationId) {
        try {
            const response = await fetch(`${API_URL}/analytics/reason`, {
                headers: getHeaders(),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },
    async getWasteTrends(organizationId) {
        try {
            const response = await fetch(`${API_URL}/analytics/trends`, {
                headers: getHeaders(),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },
    async getCommunityImpact() {
        try {
            const response = await fetch(`${API_URL}/analytics/impact/community`, {
                headers: getHeaders(),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    }
};

export const donationService = {
    async getAvailableDonations() {
        try {
            const response = await fetch(`${API_URL}/donations/marketplace`, {
                headers: getHeaders(),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },
    async getMyDonations() {
        try {
            const response = await fetch(`${API_URL}/donations/my-posts`, {
                headers: getHeaders(),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },
    async getMyClaims() {
        try {
            const response = await fetch(`${API_URL}/donations/my-claims`, {
                headers: getHeaders(),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },
    async createDonation(donationData) {
        try {
            const response = await fetch(`${API_URL}/donations`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(donationData),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },
    async claimDonation(id) {
        try {
            const response = await fetch(`${API_URL}/donations/${id}/claim`, {
                method: 'PUT',
                headers: getHeaders(),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },
    async completeDonation(id) {
        try {
            const response = await fetch(`${API_URL}/donations/${id}/complete`, {
                method: 'PUT',
                headers: getHeaders(),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    }
};

export const supplierService = {
    async getSuppliers() {
        try {
            const response = await fetch(`${API_URL}/suppliers`, {
                headers: getHeaders(),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to fetch suppliers');
            return { data: data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    async createSupplier(supplierData) {
        try {
            const response = await fetch(`${API_URL}/suppliers`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(supplierData),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    async updateSupplier(id, supplierData) {
        try {
            const response = await fetch(`${API_URL}/suppliers/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(supplierData),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    async deleteSupplier(id) {
        try {
            const response = await fetch(`${API_URL}/suppliers/${id}`, {
                method: 'DELETE',
                headers: getHeaders(),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return { error: null };
        } catch (error) {
            return { error };
        }
    }
};

export const teamService = {
    async getTeamMembers() {
        try {
            const response = await fetch(`${API_URL}/team`, {
                headers: getHeaders(),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },
    async addMember(memberData) {
        try {
            const response = await fetch(`${API_URL}/team`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(memberData),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },
    async updateMemberRole(id, role) {
        try {
            const response = await fetch(`${API_URL}/team/${id}/role`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify({ role }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },
    async removeMember(id) {
        try {
            const response = await fetch(`${API_URL}/team/${id}`, {
                method: 'DELETE',
                headers: getHeaders(),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return { error: null };
        } catch (error) {
            return { error };
        }
    }
};

export const aiService = {
    async analyzeItem(itemName, category, quantity, unit, expiryDate, purchasePrice) {
        try {
            const response = await fetch(`${API_URL}/ai/analyze-item`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ itemName, category, quantity, unit, expiryDate, purchasePrice }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    async extractReceipt(receiptText, receiptImage = null) {
        try {
            const response = await fetch(`${API_URL}/ai/extract-receipt`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ receiptText, receiptImage }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    async getWasteInsights() {
        try {
            const response = await fetch(`${API_URL}/ai/waste-insights`, {
                headers: getHeaders(),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    async predictWaste(itemName, category, quantity, purchasePrice, expiryDate) {
        try {
            const response = await fetch(`${API_URL}/ai/predict-waste`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ itemName, category, quantity, purchasePrice, expiryDate }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    }
};

