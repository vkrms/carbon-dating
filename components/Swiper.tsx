import React, { useRef, useState } from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedGestureHandler,
    withSpring,
    withTiming,
    withDelay,
    
} from 'react-native-reanimated';
import { GestureHandlerRootView, PanGestureHandler, Gesture, GestureDetector } from 'react-native-gesture-handler';

import { GoHeartFill } from "react-icons/go";
import { RxCross1 } from "react-icons/rx";
import { IconContext } from "react-icons";


import { people } from '@/constants/People';

function handleSwipeRelease(direction: string) {
    console.log({direction})

    // we replace person here
}

type Person = {
    name: string;
    age: number;
    img: string;
}

const offsetCap = 130;

const Swiper = () => {
    const pressed = useSharedValue<boolean>(false);
    const offset = useSharedValue<number>(0);
    const border = useSharedValue<boolean>(false)
    const direction = useSharedValue<string>('center')

    const [person, setPerson] = useState<Person>(people[0]);
    const personIndex = useRef(0)

    const [nextPerson, setNextPerson] = useState<Person>(people[1]);

    
    function getRand(skipThis: number) {
        if (people.length <= 1) {
            throw new Error("Array must contain more than one element.");
        }

        let rand: number;
        do {
            rand = Math.floor(Math.random() * people.length);
        } while (rand === skipThis);

        return rand
    } 

    const releaseBoth = () => {
        // handleSwipeRelease('left')

        const rand = getRand(personIndex.current)

        // the next bg card is loaded
        personIndex.current = rand

        // todo: us there a proper callback in the animation lib?
        setTimeout(() => {
            // bg card becomes fg card
            setPerson(nextPerson)

            setNextPerson(people[rand])
        }, finalizeTimeout)
    }

    const finalizeTimeout = 300

    const releaseRight = () => {
        handleSwipeRelease('right')
        setPerson(people[2])
    }

    const pan = Gesture.Pan()
        .onBegin(() => {
            pressed.value = true
            direction.value = 'center'
        })

        .onChange((e) => {
            offset.value = e.translationX;

            if (e.translationX > offsetCap) {
                // callBackRight();
            }

            if (e.translationX < -1 * offsetCap) {
                // callBackLeft();
            }
        }
    )
        .onTouchesCancelled(() => {
            console.log('touches cancelled')
        })

        .onTouchesUp(() => {
            const positive = offset.value > offsetCap
            const negative = offset.value < -1 * offsetCap

            console.log('touches up callback')

            const flyAwayOffset = 500

            if (positive) {
                releaseBoth()
                console.log('went right')
                offset.value = withSpring(flyAwayOffset);
                direction.value = 'right'
            }

            if (negative) {
                releaseBoth()
                console.log('went left')
                offset.value = withSpring(-1 * flyAwayOffset);
                direction.value = 'left'
            }

            pressed.value = false;
        })

        .onFinalize(() => {
            console.log('finalized')

            if (direction.value === 'center') {
                offset.value = withSpring(0);
                pressed.value = false;
                return
            }

            // add pink border
            // border.value = true
            
            // timeout to animate the card flying sideways
            setTimeout(() => {
                offset.value = 0;
                pressed.value = false;
            }, finalizeTimeout)
        })


    const animatedStyles = useAnimatedStyle(() => ({
        transform: [
            { translateX: offset.value },
            { scale: withTiming(pressed.value ? 1.1 : 1) },
            { rotate: `${offset.value / 25}deg` },
        ],
        backgroundColor: pressed.value ? '#FFE04B' : '#b58df1',
        border: border.value ? '1px solid hotpink' : 'none'
    }));

    

    const yesNoStyle = useAnimatedStyle(() => {
        const opacity = Math.abs(offset.value) * 0.5 / 100
        const isNegative = offset.value < 0
        return {
            opacity,
            backgroundColor: isNegative ? 'salmon' : 'lightgreen',
        }
    })

    const yesStyle = useAnimatedStyle(() => ({
        opacity: offset.value * 0.6 / 100
    }))

    const noStyle = useAnimatedStyle(() => ({
        opacity: -1 * offset.value * 0.6 / 100
    }))

    // todo: fetch image
    // async function getImage() {
    //     fetch('https://xsgames.co/randomusers/avatar.php').then((response) => {
    //         console.log({ response })
    //     })
    // }

    return (
        <IconContext.Provider value={{ size: "2em" }}>
            <GestureHandlerRootView style={styles.swiper}>
                <GestureDetector gesture={pan}>
                    
                    <Animated.View testID="theCard" style={[styles.card, animatedStyles]}>

                        <Animated.View testID="yesNoIcon" style={[styles.yesNo, yesNoStyle]}>
                            <Animated.View style={[noStyle, styles.yesNoSymbol]}>
                                <RxCross1 color="white" width={24} height={24} />
                            </Animated.View>
                            
                            <Animated.View style={[yesStyle, styles.yesNoSymbol]}>
                                <GoHeartFill color='white' width={24} height={24} />
                            </Animated.View>
                        </Animated.View>

                        <Image testID="cardPhoto" source={person.img} style={styles.image}/>

                        <View testID="cardFooter" style={styles.info}>
                            <Text style={styles.name}>{person.name}, {person.age}</Text>

                            {/* <pre>{src}</pre> */}
                        </View>
                    </Animated.View>                
                </GestureDetector>
                
                <View testID="bg-card" style={[styles.card, styles.nextCard]}>
                    <Image source={nextPerson.img} style={styles.image} />

                    <View style={styles.info}>
                        <Text style={styles.name}>{nextPerson.name}, {nextPerson.age}</Text>

                        {/* <pre>{src}</pre> */}
                    </View>
                </View>

            </GestureHandlerRootView>
        </IconContext.Provider>
    );
};

const styles = StyleSheet.create({
    swiper: {
        paddingTop: 40,
        maxWidth: '100%',
    },
    card: {
        maxWidth: '100%',
        width: 350,
        height: 'auto',
        aspectRatio: '350 / 538',
        borderRadius: 35,
        overflow: 'hidden',
        backgroundColor: 'white',
        shadowColor: "#333",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    nextCard: {
        position: 'absolute',
        // top: 0,
        left: 0,
        zIndex: -1,
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    info: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        padding: 24,        
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    yesNo: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 100,
        backgroundColor: 'salmon',
        zIndex: 1,
        margin: 'auto',
        left: 0,
        right: 0,
        top: '33%',
        opacity: 0,
    },
    yesNoSymbol: {
        position: 'absolute',
        margin: 'auto',
        width: 32,
        height: 32,
        right: 0,
        left: 0,
        top: 0,
        bottom: 0,
        textAlign: 'center',
        display: 'flex',
        lineHeight: 0,
    }
});

export default Swiper;