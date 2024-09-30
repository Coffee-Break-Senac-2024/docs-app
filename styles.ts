import { StyleSheet, useWindowDimensions } from "react-native";

export function useStyles() {
    const { width, height } = useWindowDimensions();

    return StyleSheet.create({
        container: {
            flex: 1,
            flexDirection: 'row'
        },
    })
}