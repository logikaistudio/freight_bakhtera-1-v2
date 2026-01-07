import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import Modal from '../../components/Common/Modal';
import Button from '../../components/Common/Button';
import { Plus, Building, MapPin, CreditCard, Upload, X, Image as ImageIcon, Trash2, Phone, Mail, FileText } from 'lucide-react';
import { validateAndConvertImage } from '../../utils/validateImage';

const CompanySettings = () => {
    const {
        companySettings,
        bankAccounts,
        updateCompanySettings,
        addBankAccount,
        updateBankAccount,
        deleteBankAccount,
        uploadCompanyLogo,
        fetchCompanySettings
    } = useData();

    // Local state for form
    const [companyName, setCompanyName] = useState('');
    const [companyAddress, setCompanyAddress] = useState('');
    const [companyPhone, setCompanyPhone] = useState('');
    const [companyFax, setCompanyFax] = useState('');
    const [companyEmail, setCompanyEmail] = useState('');
    const [companyNpwp, setCompanyNpwp] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [logoPreview, setLogoPreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Bank account modal state
    const [isBankModalOpen, setIsBankModalOpen] = useState(false);
    const [editingBank, setEditingBank] = useState(null);
    const [bankFormData, setBankFormData] = useState({
        bank_name: '',
        account_number: '',
        account_holder: '',
        branch: ''
    });

    // Load company settings on mount
    useEffect(() => {
        if (companySettings) {
            setCompanyName(companySettings.company_name || '');
            setCompanyAddress(companySettings.company_address || '');
            setCompanyPhone(companySettings.company_phone || '');
            setCompanyFax(companySettings.company_fax || '');
            setCompanyEmail(companySettings.company_email || '');
            setCompanyNpwp(companySettings.company_npwp || '');
            setLogoUrl(companySettings.logo_url || '');
        }
    }, [companySettings]);

    // Handle company info save
    const handleSaveCompanyInfo = async () => {
        setIsSaving(true);
        try {
            console.log('💾 Saving company info...');
            await updateCompanySettings({
                company_name: companyName,
                company_address: companyAddress,
                company_phone: companyPhone,
                company_fax: companyFax,
                company_email: companyEmail,
                company_npwp: companyNpwp,
                logo_url: logoUrl
            });
            console.log('✅ Company info saved!');

            // Refresh data from database
            await fetchCompanySettings();

            alert('✅ Informasi perusahaan berhasil disimpan');
        } catch (error) {
            console.error('Error saving company info:', error);
            alert('❌ Gagal menyimpan: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    // Handle logo upload
    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            // Validate image
            const { base64 } = await validateAndConvertImage(file);

            // Upload to Supabase
            const uploadedUrl = await uploadCompanyLogo(file);

            // Update state
            setLogoUrl(uploadedUrl);
            setLogoPreview(base64);

            alert('✅ Logo berhasil diupload');
        } catch (error) {
            console.error('Error uploading logo:', error);
            alert('❌ ' + error.message);
        } finally {
            setIsUploading(false);
            e.target.value = ''; // Reset input
        }
    };

    // Handle remove logo
    const handleRemoveLogo = () => {
        if (window.confirm('Hapus logo perusahaan?')) {
            setLogoUrl('');
            setLogoPreview(null);
        }
    };

    // Handle bank account modal
    const handleOpenBankModal = (bank = null) => {
        if (bank) {
            setEditingBank(bank);
            setBankFormData({
                bank_name: bank.bank_name,
                account_number: bank.account_number,
                account_holder: bank.account_holder,
                branch: bank.branch || ''
            });
        } else {
            setEditingBank(null);
            setBankFormData({
                bank_name: '',
                account_number: '',
                account_holder: '',
                branch: ''
            });
        }
        setIsBankModalOpen(true);
    };

    // Handle bank account submit
    const handleBankSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingBank) {
                await updateBankAccount(editingBank.id, bankFormData);
            } else {
                // Check max 4 accounts
                if (bankAccounts.length >= 4) {
                    alert('⚠️ Maksimal 4 rekening bank');
                    return;
                }
                await addBankAccount(bankFormData);
            }
            setIsBankModalOpen(false);
            alert('✅ Rekening bank berhasil disimpan');
        } catch (error) {
            console.error('Error saving bank account:', error);
            alert('❌ Gagal menyimpan: ' + error.message);
        }
    };

    // Handle delete bank account
    const handleDeleteBank = async (bankId) => {
        if (window.confirm('Hapus rekening bank ini?')) {
            try {
                await deleteBankAccount(bankId);
                alert('✅ Rekening bank berhasil dihapus');
            } catch (error) {
                console.error('Error deleting bank:', error);
                alert('❌ Gagal menghapus: ' + error.message);
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold gradient-text mb-2">Pengaturan Perusahaan</h1>
                <p className="text-silver-dark">Kelola informasi perusahaan, rekening bank, dan logo</p>
            </div>

            {/* Company Information Card */}
            <div className="glass-card p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-6">
                    <Building className="w-6 h-6 text-accent-blue" />
                    <h2 className="text-xl font-bold text-silver-light">Informasi Perusahaan</h2>
                </div>

                <div className="space-y-4">
                    {/* Company Name */}
                    <div>
                        <label className="block text-sm font-medium text-silver-dark mb-2">
                            Nama Perusahaan *
                        </label>
                        <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="PT Bakhtera Satu Indonesia"
                            className="w-full"
                        />
                    </div>

                    {/* Company Address */}
                    <div>
                        <label className="block text-sm font-medium text-silver-dark mb-2">
                            Alamat Perusahaan
                        </label>
                        <textarea
                            value={companyAddress}
                            onChange={(e) => setCompanyAddress(e.target.value)}
                            placeholder="Jl. Contoh No. 123, Jakarta"
                            rows={3}
                            className="w-full"
                        />
                    </div>

                    {/* Phone & Fax row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-silver-dark mb-2">
                                <Phone className="w-4 h-4 inline mr-1" /> Telepon
                            </label>
                            <input
                                type="tel"
                                value={companyPhone}
                                onChange={(e) => setCompanyPhone(e.target.value)}
                                placeholder="+62 21 xxx xxxx"
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-silver-dark mb-2">
                                <Phone className="w-4 h-4 inline mr-1" /> Fax
                            </label>
                            <input
                                type="tel"
                                value={companyFax}
                                onChange={(e) => setCompanyFax(e.target.value)}
                                placeholder="+62 21 xxx xxxx"
                                className="w-full"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-silver-dark mb-2">
                            <Mail className="w-4 h-4 inline mr-1" /> Email
                        </label>
                        <input
                            type="email"
                            value={companyEmail}
                            onChange={(e) => setCompanyEmail(e.target.value)}
                            placeholder="info@perusahaan.com"
                            className="w-full"
                        />
                    </div>

                    {/* NPWP */}
                    <div>
                        <label className="block text-sm font-medium text-silver-dark mb-2">
                            <FileText className="w-4 h-4 inline mr-1" /> NPWP
                        </label>
                        <input
                            type="text"
                            value={companyNpwp}
                            onChange={(e) => setCompanyNpwp(e.target.value)}
                            placeholder="00.000.000.0-000.000"
                            className="w-full"
                            maxLength="20"
                        />
                        <p className="text-xs text-silver-dark mt-1">Format: 00.000.000.0-000.000</p>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <Button onClick={handleSaveCompanyInfo} disabled={isSaving}>
                        {isSaving ? '⏳ Menyimpan...' : '💾 Simpan Informasi'}
                    </Button>
                </div>
            </div>

            {/* Company Logo Card */}
            <div className="glass-card p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-6">
                    <ImageIcon className="w-6 h-6 text-accent-purple" />
                    <h2 className="text-xl font-bold text-silver-light">Logo Perusahaan</h2>
                </div>

                <div className="space-y-4">
                    {/* Logo Preview */}
                    {(logoUrl || logoPreview) && (
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <img
                                    src={logoPreview || logoUrl}
                                    alt="Company Logo"
                                    className="w-32 h-32 object-contain rounded-lg border border-dark-border bg-dark-surface p-2"
                                />
                                <button
                                    onClick={handleRemoveLogo}
                                    className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                                    title="Hapus Logo"
                                >
                                    <X className="w-4 h-4 text-white" />
                                </button>
                            </div>
                            <div className="text-sm text-silver-dark">
                                <p>Logo aktif</p>
                                <p className="text-xs mt-1">Klik ikon X untuk menghapus</p>
                            </div>
                        </div>
                    )}

                    {/* Upload Input */}
                    <div>
                        <label className="block text-sm font-medium text-silver-dark mb-2">
                            Upload Logo Baru
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="file"
                                accept=".jpg,.jpeg,.png"
                                onChange={handleLogoUpload}
                                disabled={isUploading}
                                className="flex-1"
                            />
                            {isUploading && (
                                <span className="text-sm text-accent-blue">Uploading...</span>
                            )}
                        </div>
                        <p className="text-xs text-silver-dark mt-2">
                            Format: JPEG, JPG, PNG | Maksimal 200KB
                        </p>
                    </div>
                </div>
            </div>

            {/* Bank Accounts Card */}
            <div className="glass-card p-6 rounded-lg">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <CreditCard className="w-6 h-6 text-accent-green" />
                        <h2 className="text-xl font-bold text-silver-light">Rekening Bank</h2>
                        <span className="text-sm text-silver-dark">
                            ({bankAccounts.length}/4)
                        </span>
                    </div>
                    <Button
                        onClick={() => handleOpenBankModal()}
                        icon={Plus}
                        disabled={bankAccounts.length >= 4}
                    >
                        Tambah Rekening
                    </Button>
                </div>

                {/* Bank Accounts List */}
                {bankAccounts.length === 0 ? (
                    <div className="text-center py-8 text-silver-dark">
                        <CreditCard className="w-16 h-16 mx-auto mb-3 opacity-30" />
                        <p>Belum ada rekening bank</p>
                        <p className="text-sm mt-2">Klik "Tambah Rekening" untuk menambah</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {bankAccounts.map((bank, index) => (
                            <div
                                key={bank.id}
                                className="glass-card p-4 rounded-lg border border-dark-border hover:border-accent-green transition-colors cursor-pointer"
                                onClick={() => handleOpenBankModal(bank)}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-accent-green bg-opacity-20 flex items-center justify-center">
                                            <span className="text-accent-green font-bold text-sm">
                                                {index + 1}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-silver-light">{bank.bank_name}</h3>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteBank(bank.id);
                                        }}
                                        className="p-1 hover:bg-red-500 hover:bg-opacity-20 rounded transition-colors"
                                        title="Hapus Rekening"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-400" />
                                    </button>
                                </div>
                                <div className="space-y-1 text-sm">
                                    <p className="text-silver-dark">
                                        <span className="text-silver">No. Rek:</span> {bank.account_number}
                                    </p>
                                    <p className="text-silver-dark">
                                        <span className="text-silver">A/N:</span> {bank.account_holder}
                                    </p>
                                    {bank.branch && (
                                        <p className="text-silver-dark">
                                            <span className="text-silver">Cabang:</span> {bank.branch}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {bankAccounts.length >= 4 && (
                    <div className="mt-4 p-3 bg-accent-orange bg-opacity-10 border border-accent-orange rounded-lg">
                        <p className="text-sm text-accent-orange">
                            ⚠️ Maksimal 4 rekening bank tercapai
                        </p>
                    </div>
                )}
            </div>

            {/* Bank Account Modal */}
            <Modal
                isOpen={isBankModalOpen}
                onClose={() => setIsBankModalOpen(false)}
                title={editingBank ? 'Edit Rekening Bank' : 'Tambah Rekening Bank'}
            >
                <form onSubmit={handleBankSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-silver-dark mb-2">
                            Nama Bank *
                        </label>
                        <input
                            type="text"
                            required
                            value={bankFormData.bank_name}
                            onChange={(e) => setBankFormData({ ...bankFormData, bank_name: e.target.value })}
                            placeholder="Bank Mandiri"
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-silver-dark mb-2">
                            Nomor Rekening *
                        </label>
                        <input
                            type="text"
                            required
                            value={bankFormData.account_number}
                            onChange={(e) => setBankFormData({ ...bankFormData, account_number: e.target.value })}
                            placeholder="1234567890"
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-silver-dark mb-2">
                            Atas Nama *
                        </label>
                        <input
                            type="text"
                            required
                            value={bankFormData.account_holder}
                            onChange={(e) => setBankFormData({ ...bankFormData, account_holder: e.target.value })}
                            placeholder="PT Bakhtera Satu"
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-silver-dark mb-2">
                            Cabang
                        </label>
                        <input
                            type="text"
                            value={bankFormData.branch}
                            onChange={(e) => setBankFormData({ ...bankFormData, branch: e.target.value })}
                            placeholder="Jakarta Pusat"
                            className="w-full"
                        />
                    </div>

                    <div className="flex gap-3 justify-end mt-6">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsBankModalOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button type="submit">
                            {editingBank ? 'Update' : 'Simpan'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default CompanySettings;

