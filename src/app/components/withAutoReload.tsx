import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';

const withAutoReload = (WrappedComponent: React.FC) => {
  return (props: any) => {
    const navigation = useNavigation();
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
      const unsubscribe = navigation.addListener('focus', () => {
        setReloadKey((prev) => prev + 1);
      });

      return unsubscribe;
    }, [navigation]);

    return <WrappedComponent key={reloadKey} {...props} />;
  };
};

export default withAutoReload;
