import styles from './PetDetails.module.css';

import api from '../../../utils/api';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

/* hooks*/ 

import useFlashMessage from '../../../hooks/useFlashMessage';

export default function PetDetails(){
    return(
        <h1>Página de Pet</h1>
    )
}