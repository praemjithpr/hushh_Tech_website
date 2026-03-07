'use client';

import React, { useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "react-phone-input-2/lib/style.css";
import PhoneInput from "react-phone-input-2";
// @ts-ignore
import countryList from "react-select-country-list";
import OnboardingShell from "../../components/OnboardingShell";
import {
  Check,
  Upload,
  Plus,
  Trash2,
  Shield,
  Building2,
  ChevronDown,
  User
} from "lucide-react";

/**
 * KYCFormPage (Fundrise-Inspired Revamp)
 * This component handles the 4-step KYC process using OnboardingShell.
 * It preserves all existing state, validation, and API integration logic.
 */
const KYCFormPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [investorType, setInvestorType] = useState("individual");
  const [formData, setFormData] = useState<any>({
    isUSTaxPerson: false
  });
  const [formErrors, setFormErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptedDeclarations, setAcceptedDeclarations] = useState<Record<string, boolean>>({});
  const [eddScreening, setEddScreening] = useState({
    isPep: false,
    isHighRiskJurisdiction: false,
    investmentAmountExceeds10m: false,
    hasComplexStructure: false
  });
  const [beneficialOwners, setBeneficialOwners] = useState<any[]>([{
    fullLegalName: "",
    residentialAddress: { street: "", city: "", state: "", postalCode: "", country: "" },
    dateOfBirth: "",
    nationality: "",
    idNumber: "",
    ownershipPercentage: ""
  }]);
  const [authorizedSignatories, setAuthorizedSignatories] = useState<any[]>([{
    fullLegalName: "",
    position: ""
  }]);

  // File upload references
  const fileRefs: any = {
    idDocument: useRef<HTMLInputElement>(null),
    proofOfAddress: useRef<HTMLInputElement>(null),
    taxFormW9: useRef<HTMLInputElement>(null),
    taxFormW8BEN: useRef<HTMLInputElement>(null),
    sourceOfFundsDoc: useRef<HTMLInputElement>(null),
    articlesOfIncorporation: useRef<HTMLInputElement>(null),
    operatingAgreement: useRef<HTMLInputElement>(null),
    certificateOfGoodStanding: useRef<HTMLInputElement>(null),
    authorizationDocument: useRef<HTMLInputElement>(null),
    financialDocuments: useRef<HTMLInputElement>(null),
  };

  // File state
  const [files, setFiles] = useState<Record<string, File | null>>({
    idDocument: null,
    proofOfAddress: null,
    taxFormW9: null,
    taxFormW8BEN: null,
    sourceOfFundsDoc: null,
    articlesOfIncorporation: null,
    operatingAgreement: null,
    certificateOfGoodStanding: null,
    authorizationDocument: null,
    financialDocuments: null,
  });

  // Dynamic BO refs
  const [beneficialOwnerIdRefs, setBeneficialOwnerIdRefs] = useState<React.RefObject<HTMLInputElement>[]>([React.createRef<HTMLInputElement>()]);
  const [beneficialOwnerIdFiles, setBeneficialOwnerIdFiles] = useState<(File | null)[]>([null]);

  const countryOptions = useMemo(() => countryList().getData(), []);

  const declarations = [
    { id: "decl1", text: "I/We confirm that I am/we are the beneficial owner(s) of the investment capital." },
    { id: "decl2", text: "I/We certify that the funds used for this investment originate from legitimate and legal sources and are not linked to any illicit activities, including money laundering or terrorist financing." },
    { id: "decl3", text: "I/We confirm that I/we (and any associated beneficial owners/entities) are not listed on OFAC, EU, UK, UN, FATF, or other relevant sanctions watchlists, nor are we acting on behalf of any sanctioned individuals or entities." },
    { id: "decl4", text: "I/We confirm that I/we are not investing from, nor are we (or our entity) primarily operating in, a jurisdiction classified as non-cooperative by FATF or the U.S. Treasury, or otherwise prohibited by the Fund." },
    { id: "decl5", text: "I/We agree to fully disclose my/our identity and source of funds as required by the Fund." },
    { id: "decl6", text: "I/We commit to submitting all required AML/KYC documents promptly before capital acceptance and subscription processing." },
    { id: "decl7", text: "I/We agree to undergo additional due diligence if requested by the Fund, which may include providing a Bank Reference Letter, detailed wealth origin documentation, or participating in a verification call." },
    { id: "decl8", text: "I/We understand that the Fund maintains an ongoing monitoring framework and may request updated information periodically." },
    { id: "decl9", text: "I/We certify that all information and documentation provided in this form is true, complete, and accurate to the best of my/our knowledge." },
    { id: "decl10", text: "I/We acknowledge that failure to comply with the Fund's AML/KYC requirements may result in investment rejection or redemption suspension." },
    { id: "decl11", text: "I/We certify that I/we comply with all AML/KYC regulations applicable to my/our jurisdiction." },
    { id: "decl12", text: "By submitting this form, I/we acknowledge that I/we have read, understood, and agree to the terms outlined in the Hushh Renaissance Aloha & Alpha Fund, LP's AML/KYC Documentation." },
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors((prev: any) => ({ ...prev, [field]: null }));
  };

  const handleFileChange = (fieldName: string, event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setFiles(prev => ({ ...prev, [fieldName]: file }));
      if (formErrors[fieldName]) setFormErrors((prev: any) => ({ ...prev, [fieldName]: null }));
    }
  };

  const validateStep = (step: number) => {
    const errors: Record<string, string> = {};
    if (step === 2) {
      if (investorType === 'individual') {
        const fields = ['fullLegalName', 'dateOfBirth', 'nationality', 'identificationType', 'identificationNumber', 'identificationIssuingCountry', 'identificationIssueDate', 'identificationExpiryDate', 'streetAddress', 'city', 'state', 'postalCode', 'country', 'taxCountry', 'taxIdentificationNumber', 'sourceOfFundsDescription'];
        fields.forEach(f => { if (!formData[f]) errors[f] = "Required"; });
      } else {
        const fields = ['legalEntityName', 'registrationNumber', 'incorporationDate', 'jurisdiction', 'natureOfBusiness', 'regStreetAddress', 'regCity', 'regState', 'regPostalCode', 'regCountry', 'entitySourceOfFundsDescription'];
        fields.forEach(f => { if (!formData[f]) errors[f] = "Required"; });
      }
    } else if (step === 3) {
      if (investorType === 'individual') {
        if (!files.idDocument) errors.idDocument = "Required";
        if (!files.proofOfAddress) errors.proofOfAddress = "Required";
        if (formData.isUSTaxPerson && !files.taxFormW9) errors.taxFormW9 = "Required";
        if (!formData.isUSTaxPerson && !files.taxFormW8BEN) errors.taxFormW8BEN = "Required";
      } else {
        if (!files.articlesOfIncorporation) errors.articlesOfIncorporation = "Required";
        if (!files.operatingAgreement) errors.operatingAgreement = "Required";
        if (!files.certificateOfGoodStanding) errors.certificateOfGoodStanding = "Required";
        if (!files.authorizationDocument) errors.authorizationDocument = "Required";
      }
    } else if (step === 4) {
      declarations.forEach(d => { if (!acceptedDeclarations[d.id]) errors[`declaration_${d.id}`] = "Required"; });
      if (!formData.contactName) errors.contactName = "Required";
      if (!formData.contactEmail) errors.contactEmail = "Required";
      if (!formData.contactPhone) errors.contactPhone = "Required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('investorType', investorType);
      fd.append('contactInfo', JSON.stringify({ name: formData.contactName, email: formData.contactEmail, phone: formData.contactPhone }));
      fd.append('declarations', JSON.stringify(declarations.map(d => ({ id: d.id, text: d.text, accepted: !!acceptedDeclarations[d.id] }))));
      fd.append('eddScreening', JSON.stringify(eddScreening));

      if (investorType === 'individual') {
        fd.append('investorDetails', JSON.stringify({
          fullLegalName: formData.fullLegalName, dateOfBirth: formData.dateOfBirth, nationality: formData.nationality,
          idType: formData.identificationType, idNumber: formData.identificationNumber, idIssuingCountry: formData.identificationIssuingCountry,
          issueDate: formData.identificationIssueDate, expiryDate: formData.identificationExpiryDate,
          address: { street: formData.streetAddress, city: formData.city, state: formData.state, zip: formData.postalCode, country: formData.country },
          tax: { country: formData.taxCountry, tin: formData.taxIdentificationNumber, isUS: formData.isUSTaxPerson },
          sof: formData.sourceOfFundsDescription
        }));
        if (files.idDocument) fd.append('idDocument', files.idDocument);
        if (files.proofOfAddress) fd.append('addressProof', files.proofOfAddress);
        if (files.taxFormW9) fd.append('taxForm', files.taxFormW9);
        if (files.taxFormW8BEN) fd.append('taxForm', files.taxFormW8BEN);
        if (files.sourceOfFundsDoc) fd.append('sofDoc', files.sourceOfFundsDoc);
      } else {
        fd.append('investorDetails', JSON.stringify({
          entityName: formData.legalEntityName, regNo: formData.registrationNumber, incDate: formData.incorporationDate,
          jurisdiction: formData.jurisdiction, nature: formData.natureOfBusiness,
          address: { street: formData.regStreetAddress, city: formData.regCity, state: formData.regState, zip: formData.regPostalCode, country: formData.regCountry },
          sof: formData.entitySourceOfFundsDescription
        }));
        fd.append('beneficialOwners', JSON.stringify(beneficialOwners));
        fd.append('authorizedSignatories', JSON.stringify(authorizedSignatories));
        if (files.articlesOfIncorporation) fd.append('articlesOfInc', files.articlesOfIncorporation);
        if (files.operatingAgreement) fd.append('operatingAgreement', files.operatingAgreement);
        if (files.certificateOfGoodStanding) fd.append('goodStanding', files.certificateOfGoodStanding);
        if (files.authorizationDocument) fd.append('authDoc', files.authorizationDocument);
        if (files.financialDocuments) fd.append('financials', files.financialDocuments);
        beneficialOwnerIdFiles.forEach((f, i) => { if (f) fd.append(`boId_${i}`, f); });
      }

      await axios.post('https://hushh-techh.onrender.com/api/admin/kyc-verification', fd);
      navigate("/onboarding/verify-complete");
    } catch (err) {
      console.error(err);
      alert("Submission failed. Please check form and network.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
    else navigate(-1);
  };

  const handleContinue = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) setCurrentStep(currentStep + 1);
      else handleSubmit();
    }
  };

  // UI Components
  const Field = ({ label, id, type = "text", placeholder, options, isRequired = true }: any) => (
    <div className="flex flex-col space-y-2">
      <label className="text-[13px] font-bold text-[#151513] tracking-wide uppercase">
        {label} {isRequired && <span className="text-[#AA4528]">*</span>}
      </label>
      {type === "select" ? (
        <div className="relative">
          <select
            value={formData[id] || ''}
            onChange={e => handleInputChange(id, e.target.value)}
            className={`w-full h-12 px-4 bg-white border ${formErrors[id] ? 'border-red-500' : 'border-[#EEE9E0]'} focus:border-[#AA4528] outline-none rounded-sm text-[15px] appearance-none`}
          >
            <option value="">{placeholder || 'Select...'}</option>
            {options?.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8479] pointer-events-none" />
        </div>
      ) : type === "textarea" ? (
        <textarea
          value={formData[id] || ''}
          onChange={e => handleInputChange(id, e.target.value)}
          className={`w-full p-4 bg-white border ${formErrors[id] ? 'border-red-500' : 'border-[#EEE9E0]'} focus:border-[#AA4528] outline-none rounded-sm text-[15px] resize-none h-32`}
        />
      ) : (
        <input
          type={type}
          value={formData[id] || ''}
          onChange={e => handleInputChange(id, e.target.value)}
          placeholder={placeholder}
          className={`w-full h-12 px-4 bg-white border ${formErrors[id] ? 'border-red-500' : 'border-[#EEE9E0]'} focus:border-[#AA4528] outline-none rounded-sm text-[15px]`}
        />
      )}
      {formErrors[id] && <p className="text-[12px] text-red-500 font-medium">{formErrors[id]}</p>}
    </div>
  );

  const FileBox = ({ label, id, file, refObj, onFile, helper, isRequired }: any) => (
    <div className="flex flex-col space-y-3">
      <label className="text-[13px] font-bold text-[#151513] tracking-wide uppercase">{label} {isRequired && <span className="text-[#AA4528]">*</span>}</label>
      <div
        onClick={() => refObj.current?.click()}
        className={`cursor-pointer border-2 border-dashed ${file ? 'border-[#2D7A41] bg-[#F3F9F4]' : 'border-[#EEE9E0] hover:border-[#AA4528] bg-white'} p-6 rounded-sm text-center transition-all`}
      >
        <Upload className={`w-8 h-8 mx-auto mb-2 ${file ? 'text-[#2D7A41]' : 'text-[#8C8479]'}`} />
        <p className="text-[14px] font-medium text-[#151513] truncate">{file ? file.name : `Choose file`}</p>
        {helper && <p className="text-[11px] text-[#8C8479] mt-1">{helper}</p>}
        <input type="file" ref={refObj} className="hidden" onChange={e => onFile(id, e)} accept=".pdf,.png,.jpg,.jpeg" />
      </div>
      {formErrors[id] && <p className="text-[12px] text-red-500 font-medium">{formErrors[id]}</p>}
    </div>
  );

  return (
    <OnboardingShell
      step={currentStep}
      totalSteps={4}
      onBack={handleBack}
      onContinue={handleContinue}
      continueLabel={currentStep === 4 ? (isSubmitting ? 'Submitting...' : 'Submit Form') : 'Continue'}
      continueLoading={isSubmitting}
    >
      <div className="max-w-2xl mx-auto w-full pb-20">
        <div className="text-center mb-10">
          <h1 className="text-[2.2rem] md:text-[2.8rem] font-medium text-[#151513] mb-4 font-display leading-[1.1]">
            {currentStep === 1 && "Start Your Verification"}
            {currentStep === 2 && "Personal Information"}
            {currentStep === 3 && "Verification Documents"}
            {currentStep === 4 && "Final Declarations"}
          </h1>
          <p className="text-[16px] text-[#8C8479] max-w-md mx-auto leading-relaxed">
            {currentStep === 1 && "Select the account type that best describes your investment intent."}
            {currentStep === 2 && "Provide your legal details to comply with global financial regulations."}
            {currentStep === 3 && "Securely upload proof of identity and address for our compliance team."}
            {currentStep === 4 && "Carefully review and confirm the required legal declarations."}
          </p>
        </div>

        {currentStep === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => setInvestorType('individual')}
              className={`p-8 border-2 text-left rounded-sm transition-all ${investorType === 'individual' ? 'border-[#AA4528] bg-[#FDF9F7]' : 'border-[#EEE9E0] bg-white hover:border-[#AA4528]'}`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-6 ${investorType === 'individual' ? 'bg-[#AA4528] text-white' : 'bg-[#F7F5F0] text-[#151513]'}`}><User className="w-6 h-6" /></div>
              <h3 className="text-[18px] font-bold text-[#151513] mb-2">Individual</h3>
              <p className="text-[14px] text-[#8C8479]">Investing as a person or joint account holders.</p>
            </button>
            <button
              onClick={() => setInvestorType('institutional')}
              className={`p-8 border-2 text-left rounded-sm transition-all ${investorType === 'institutional' ? 'border-[#AA4528] bg-[#FDF9F7]' : 'border-[#EEE9E0] bg-white hover:border-[#AA4528]'}`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-6 ${investorType === 'institutional' ? 'bg-[#AA4528] text-white' : 'bg-[#F7F5F0] text-[#151513]'}`}><Building2 className="w-6 h-6" /></div>
              <h3 className="text-[18px] font-bold text-[#151513] mb-2">Institutional</h3>
              <p className="text-[14px] text-[#8C8479]">Investing on behalf of an entity, trust, or corporation.</p>
            </button>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-8">
            {investorType === 'individual' ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="Full Legal Name" id="fullLegalName" placeholder="John Doe" />
                  <Field label="Date of Birth" id="dateOfBirth" type="date" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="Nationality" id="nationality" placeholder="e.g. United Kingdom" />
                  <Field label="ID Type" id="identificationType" type="select" options={[{ label: 'Passport', value: 'passport' }, { label: 'Drivers License', value: 'license' }]} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="ID Number" id="identificationNumber" />
                  <Field label="Issuing Country" id="identificationIssuingCountry" type="select" options={countryOptions} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="Issue Date" id="identificationIssueDate" type="date" />
                  <Field label="Expiry Date" id="identificationExpiryDate" type="date" />
                </div>
                <div className="pt-6 border-t border-[#EEE9E0]">
                  <h4 className="text-[14px] font-bold text-[#151513] uppercase tracking-widest mb-6">Residential Address</h4>
                  <Field label="Street" id="streetAddress" />
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-4">
                    <Field label="City" id="city" />
                    <Field label="State" id="state" />
                    <Field label="Postal / ZIP" id="postalCode" />
                  </div>
                  <div className="mt-4"><Field label="Country" id="country" type="select" options={countryOptions} /></div>
                </div>
                <div className="pt-6 border-t border-[#EEE9E0]">
                  <h4 className="text-[14px] font-bold text-[#151513] uppercase tracking-widest mb-6">Tax & Wealth</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label="Tax Country" id="taxCountry" type="select" options={countryOptions} />
                    <Field label="TIN / ID" id="taxIdentificationNumber" />
                  </div>
                  <label className="flex items-center space-x-3 mt-6 cursor-pointer group">
                    <div className={`w-5 h-5 flex items-center justify-center border-2 rounded-sm transition-all ${formData.isUSTaxPerson ? 'bg-[#AA4528] border-[#AA4528]' : 'border-[#EEE9E0] group-hover:border-[#AA4528]'}`}>
                      {formData.isUSTaxPerson && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <input type="checkbox" className="hidden" checked={formData.isUSTaxPerson} onChange={e => handleInputChange('isUSTaxPerson', e.target.checked)} />
                    <span className="text-[14px] text-[#151513] font-medium">I am a U.S. tax person</span>
                  </label>
                  <div className="mt-6"><Field label="Source of funds" id="sourceOfFundsDescription" type="textarea" placeholder="Describe where your investment capital originated..." /></div>
                </div>
              </>
            ) : (
              // Institutional Fields 
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="Entity Name" id="legalEntityName" />
                  <Field label="Registration #" id="registrationNumber" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="Inc. Date" id="incorporationDate" type="date" />
                  <Field label="Jurisdiction" id="jurisdiction" type="select" options={countryOptions} />
                </div>
                <Field label="Business Nature" id="natureOfBusiness" />
                <div className="pt-6 border-t border-[#EEE9E0]">
                  <h4 className="text-[14px] font-bold text-[#151513] uppercase tracking-widest mb-6">Registered Address</h4>
                  <Field label="Street" id="regStreetAddress" />
                  <div className="grid grid-cols-3 gap-6 mt-4">
                    <Field label="City" id="regCity" />
                    <Field label="State" id="regState" />
                    <Field label="ZIP" id="regPostalCode" />
                  </div>
                  <div className="mt-4"><Field label="Country" id="regCountry" type="select" options={countryOptions} /></div>
                </div>
                <div className="pt-6 border-t border-[#EEE9E0]">
                  <Field label="Origination of Funds" id="entitySourceOfFundsDescription" type="textarea" />
                </div>
              </>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-8">
            {investorType === 'individual' ? (
              <>
                <FileBox label="ID Document" id="idDocument" file={files.idDocument} refObj={fileRefs.idDocument} onFile={handleFileChange} helper="Passport or Gov ID" isRequired />
                <FileBox label="Proof of Address" id="proofOfAddress" file={files.proofOfAddress} refObj={fileRefs.proofOfAddress} onFile={handleFileChange} helper="Recent utility bill" isRequired />
                {formData.isUSTaxPerson ? (
                  <FileBox label="IRS W-9 Form" id="taxFormW9" file={files.taxFormW9} refObj={fileRefs.taxFormW9} onFile={handleFileChange} isRequired />
                ) : (
                  <FileBox label="IRS W-8BEN Form" id="taxFormW8BEN" file={files.taxFormW8BEN} refObj={fileRefs.taxFormW8BEN} onFile={handleFileChange} isRequired />
                )}
              </>
            ) : (
              <>
                <FileBox label="Articles of Inc." id="articlesOfIncorporation" file={files.articlesOfIncorporation} refObj={fileRefs.articlesOfIncorporation} onFile={handleFileChange} isRequired />
                <FileBox label="Operating Agreement" id="operatingAgreement" file={files.operatingAgreement} refObj={fileRefs.operatingAgreement} onFile={handleFileChange} isRequired />
                <FileBox label="Good Standing" id="certificateOfGoodStanding" file={files.certificateOfGoodStanding} refObj={fileRefs.certificateOfGoodStanding} onFile={handleFileChange} isRequired />
                <FileBox label="Authorization" id="authorizationDocument" file={files.authorizationDocument} refObj={fileRefs.authorizationDocument} onFile={handleFileChange} isRequired />
              </>
            )}

            <div className="pt-10 border-t border-[#EEE9E0]">
              <h4 className="text-[15px] font-bold text-[#151513] uppercase tracking-widest mb-6">Risk Screening</h4>
              <div className="space-y-4">
                {[
                  { key: 'isPep', l: 'Politically Exposed Person (PEP)' }, { key: 'isHighRiskJurisdiction', l: 'High-risk jurisdiction involvement' },
                  { key: 'investmentAmountExceeds10m', l: 'Investment exceeds $10M USD' }, { key: 'hasComplexStructure', l: 'Complex ownership structure' }
                ].map(q => (
                  <label key={q.key} className="flex p-4 border border-[#EEE9E0] rounded-sm bg-white cursor-pointer hover:border-[#AA4528] transition-all group items-center space-x-4">
                    <div className={`w-5 h-5 flex items-center justify-center border-2 rounded-sm ${(eddScreening as any)[q.key] ? 'bg-[#AA4528] border-[#AA4528]' : 'border-[#EEE9E0] group-hover:border-[#AA4528]'}`}>
                      {(eddScreening as any)[q.key] && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <input type="checkbox" className="hidden" checked={(eddScreening as any)[q.key]} onChange={e => handleEddChange(q.key, e.target.checked)} />
                    <span className="text-[14px] font-medium text-[#151513]">{q.l}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-8">
            <div className="p-6 bg-[#F7F5F0] border border-[#EEE9E0] rounded-sm">
              <h4 className="text-[14px] font-bold text-[#151513] uppercase mb-6 tracking-widest text-center">Legal Confirmations</h4>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {declarations.map(d => (
                  <label key={d.id} className="flex p-4 bg-white border border-[#EEE9E0] rounded-sm cursor-pointer hover:border-[#AA4528] transition-all group space-x-4">
                    <div className={`w-5 h-5 flex items-center justify-center border-2 rounded-sm shrink-0 transition-all ${acceptedDeclarations[d.id] ? 'bg-[#AA4528] border-[#AA4528]' : 'border-[#EEE9E0] group-hover:border-[#AA4528]'}`}>
                      {acceptedDeclarations[d.id] && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <input type="checkbox" className="hidden" checked={!!acceptedDeclarations[d.id]} onChange={e => handleDeclarationChange(d.id, e.target.checked)} />
                    <span className="text-[13px] text-[#151513] leading-relaxed">{d.text}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-[#EEE9E0] space-y-6">
              <Field label="Contact Person" id="contactName" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Contact Email" id="contactEmail" type="email" />
                <div className="flex flex-col space-y-2">
                  <label className="text-[13px] font-bold text-[#151513] uppercase tracking-wide">Contact Phone <span className="text-[#AA4528]">*</span></label>
                  <PhoneInput
                    country={'us'}
                    value={formData.contactPhone}
                    onChange={v => handleInputChange('contactPhone', v)}
                    inputClass={`!w-full !h-12 !px-12 !bg-white !border ${formErrors.contactPhone ? '!border-red-500' : '!border-[#EEE9E0]'} !focus:border-[#AA4528] !outline-none !rounded-sm`}
                  />
                  {formErrors.contactPhone && <p className="text-[12px] text-red-500 font-medium">{formErrors.contactPhone}</p>}
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-5 bg-[#FDF9F7] border border-[#AA4528]/20 rounded-sm">
              <Shield className="w-6 h-6 text-[#AA4528] shrink-0" />
              <p className="text-[13px] text-[#8C8479] leading-[1.6]">
                Your security is our priority. By submitting this form, you authorize our compliance team to process your data for AML/KYC verification. All information is secured with bank-level encryption.
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #F7F5F0; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #EEE9E0; border-radius: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #8C8479; }
        .font-display { font-family: 'Ivar Headline', serif; }
      `}</style>
    </OnboardingShell>
  );
};

export default KYCFormPage;