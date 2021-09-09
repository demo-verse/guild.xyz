import {
  Button,
  FormControl,
  FormErrorMessage,
  Input,
  SimpleGrid,
  VStack,
} from "@chakra-ui/react"
import NftFormCard from "components/add-guild/NftFormCard"
import PickGuildPlatform from "components/add-guild/PickGuildPlatform"
import TokenFormCard from "components/add-guild/TokenFormCard"
import AddCard from "components/common/AddCard"
import Layout from "components/common/Layout"
import Section from "components/common/Section"
import JSConfetti from "js-confetti"
import { useEffect, useRef, useState } from "react"
import { FormProvider, useFieldArray, useForm, useWatch } from "react-hook-form"

const CreateGuildPage = (): JSX.Element => {
  const methods = useForm({ mode: "all" })
  const jsConfetti = useRef(null)
  const [tokensList, setTokensList] = useState(null)

  useEffect(() => {
    // Pick TG by default as a platform
    methods.reset({
      guildPlatform: "TG",
    })

    // Initializing confetti
    if (!jsConfetti.current) {
      jsConfetti.current = new JSConfetti()
    }

    // Fetch ERC-20 tokens from Coingecko
    if (!tokensList) {
      fetch("https://tokens.coingecko.com/uniswap/all.json")
        .then((rawData) => rawData.json())
        .then((data) => setTokensList(data.tokens))
        .catch(console.error)
    }
  }, [])

  const {
    fields: requirementFields,
    append: appendRequirement,
    remove: removeRequirement,
  } = useFieldArray({
    control: methods.control,
    name: "requirements",
  })
  const onSubmit = (data) => {
    jsConfetti.current?.addConfetti({
      confettiColors: [
        "#6366F1",
        "#22c55e",
        "#ef4444",
        "#3b82f6",
        "#fbbf24",
        "#f472b6",
      ],
    })

    // TODO...
    console.log(data)
  }

  /*
  Form structure:
  {
    name: string,
    requirements: [
      {
        holdType: "NFT" | "POAP" | "TOKEN"
        nft?: string
        poap?: string
        token?: string
        tokenQuantity?: number
      },
      ...
    ]
  }
  */

  const addRequirement = (holdType: "NFT" | "POAP" | "TOKEN") => {
    appendRequirement({ holdType })
  }

  const newGuildName = useWatch({ control: methods.control, name: "name" })

  return (
    <FormProvider {...methods}>
      <Layout
        title={newGuildName || "Create Guild"}
        action={
          <Button
            rounded="2xl"
            colorScheme="green"
            onClick={methods.handleSubmit(onSubmit)}
          >
            Summon
          </Button>
        }
      >
        <VStack spacing={8} alignItems="start">
          <Section title="Choose a Realm">
            <PickGuildPlatform />
          </Section>

          <Section title="Choose a name for your Guild">
            <FormControl isRequired isInvalid={methods.formState.errors.name}>
              <Input
                maxWidth="sm"
                {...methods.register("name", {
                  required: "This field is required.",
                })}
              />
              <FormErrorMessage>
                {methods.formState.errors.name?.message}
              </FormErrorMessage>
            </FormControl>
          </Section>

          {requirementFields.length && (
            <Section title="Requirements">
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 5, md: 6 }}>
                {requirementFields.map((requirementForm, i) => {
                  const holdType = methods.getValues(`requirements.${i}.holdType`)

                  if (holdType === "TOKEN") {
                    return (
                      <TokenFormCard
                        // eslint-disable-next-line react/no-array-index-key
                        key={i}
                        index={i}
                        tokensList={tokensList}
                        clickHandler={() => removeRequirement(i)}
                      />
                    )
                  }

                  if (holdType === "NFT") {
                    return (
                      <NftFormCard
                        // eslint-disable-next-line react/no-array-index-key
                        key={i}
                        index={i}
                        clickHandler={() => removeRequirement(i)}
                      />
                    )
                  }

                  return <></>
                })}
              </SimpleGrid>
            </Section>
          )}

          <Section title={requirementFields.length ? "Add more" : "Requirements"}>
            <SimpleGrid
              columns={{ base: 1, md: 2, lg: 3 }}
              spacing={{ base: 5, md: 6 }}
            >
              <AddCard
                text="Hold an NFT"
                clickHandler={() => addRequirement("NFT")}
              />
              <AddCard
                text="Hold a Token"
                clickHandler={() => addRequirement("TOKEN")}
              />
              <AddCard
                text="Hold a POAP"
                clickHandler={() => addRequirement("POAP")}
              />
            </SimpleGrid>
          </Section>
        </VStack>
      </Layout>
    </FormProvider>
  )
}

export default CreateGuildPage
