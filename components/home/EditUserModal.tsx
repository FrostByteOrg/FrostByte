import EditUser from '@/components/forms/EditUser';
import Modal from '@/components/home/Modal';
import { Dispatch, SetStateAction, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { getProfile, updateUserProfile } from '@/services/profile.service';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { PostgrestError } from '@supabase/supabase-js';
import { Set } from 'typescript';

export default function EditUserModal({
  showModal,
  setShowModal
} : {
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
}){
  
}