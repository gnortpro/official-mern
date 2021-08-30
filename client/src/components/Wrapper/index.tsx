import React, { ReactNode } from 'react';
import { Box } from '@chakra-ui/react';

interface IProps {
  children: ReactNode;
}

const Wrapper: React.FC<IProps> = ({ children }) => {
  return (
    <Box maxWidth="400px" width="100%" mt={8} mx="auto">
      {children}
    </Box>
  );
};

export default Wrapper;
