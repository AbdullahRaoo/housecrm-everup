/* eslint-disable @typescript-eslint/no-explicit-any */
import { UseFormRegister } from 'react-hook-form';

interface BasicDetailsProps {
  register: UseFormRegister<any>;
  errors: any;
}

export function BasicDetails({ register, errors }: BasicDetailsProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">Property Title</label>
        <input
          type="text"
          {...register('title', { required: 'Title is required' })}
          className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200
            focus:border-[#e56e43] focus:ring-2 focus:ring-[#e56e43]/20
            transition-colors duration-200 bg-white text-gray-800
            placeholder-gray-400 shadow-sm"
          placeholder="Enter property title"
        />
        {errors.title && (
          <p className="mt-2 text-sm text-red-500 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
            </svg>
            {errors.title.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">Property Type</label>
        <select
          {...register('type', { required: 'Type is required' })}
          className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200
            focus:border-[#e56e43] focus:ring-2 focus:ring-[#e56e43]/20
            transition-colors duration-200 bg-white text-gray-800
            shadow-sm appearance-none cursor-pointer"
        >
          <option value="">Select property type</option>
          <option value="Sale">For Sale</option>
          <option value="Rent">For Rent</option>
        </select>
        {errors.type && (
          <p className="mt-2 text-sm text-red-500 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
            </svg>
            {errors.type.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">Price</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
          <input
            type="number"
            {...register('price', { required: 'Price is required' })}
            className="mt-1 block w-full pl-8 pr-4 py-3 rounded-lg border border-gray-200
              focus:border-[#e56e43] focus:ring-2 focus:ring-[#e56e43]/20
              transition-colors duration-200 bg-white text-gray-800
              placeholder-gray-400 shadow-sm"
            placeholder="Enter property price"
          />
        </div>
        {errors.price && (
          <p className="mt-2 text-sm text-red-500 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
            </svg>
            {errors.price.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">Description</label>
        <textarea
          {...register('description', { required: 'Description is required' })}
          rows={4}
          className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200
            focus:border-[#e56e43] focus:ring-2 focus:ring-[#e56e43]/20
            transition-colors duration-200 bg-white text-gray-800
            placeholder-gray-400 shadow-sm resize-none"
          placeholder="Enter property description"
        />
        {errors.description && (
          <p className="mt-2 text-sm text-red-500 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
            </svg>
            {errors.description.message}
          </p>
        )}
      </div>
    </div>
  );
}
